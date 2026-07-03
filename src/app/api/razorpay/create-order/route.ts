import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { razorpay } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    // 1. Verify user token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 2. Parse request body
    const { planId } = await request.json();
    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // 3. Fetch plan details from Firestore
    const planDoc = await adminDb.collection("plans").doc(planId).get();
    if (!planDoc.exists) {
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
