import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

function decodeFirebaseToken(token: string): string {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    if (!payload.sub) {
      throw new Error("Missing sub claim in token");
    }
    return payload.sub;
  } catch (err: any) {
    throw new Error("Failed to parse auth token: " + err.message);
  }
}

export async function POST(request: Request) {
  try {
    // 1. Verify user token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const userId = decodeFirebaseToken(token);

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
      receipt: `rcp_${userId.slice(0, 8)}_${Date.now().toString().slice(-8)}`,
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
