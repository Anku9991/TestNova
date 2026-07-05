import { NextResponse } from "next/server";
import crypto from "crypto";

async function verifyFirebaseToken(token: string): Promise<string> {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
  if (!response.ok) {
    throw new Error("Invalid token signature");
  }
  const data = await response.json();
  if (data.aud !== process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    throw new Error("Token audience mismatch");
  }
  return data.sub; // return uid
}

export async function POST(request: Request) {
  try {
    // 1. Verify user token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const userId = await verifyFirebaseToken(token);

    // 2. Parse request body
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Return success to client for client-side firestore updates
    return NextResponse.json({ success: true, userId });
  } catch (error: any) {
    console.error("Error verifying payment signature:", error);
    return NextResponse.json(
      { error: "Payment verification failed", details: error.message },
      { status: 500 }
    );
  }
}
