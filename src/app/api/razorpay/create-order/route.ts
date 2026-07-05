import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

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
    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // 3. Fetch plan details from Firestore
    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }
    const planDoc = await getDoc(doc(db, "plans", planId));
    if (!planDoc.exists()) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    const plan = planDoc.data();
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan is not active" }, { status: 400 });
    }

    // 4. Create Razorpay Order
    // Amount in Razorpay is always in the smallest currency unit (e.g. paise for INR)
    const amountInPaise = Math.round(plan.price * 100);
    const options = {
      amount: amountInPaise,
      currency: plan.currency || "INR",
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId,
        planId,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}
