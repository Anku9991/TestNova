import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import crypto from "crypto";

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

    // 4. Fetch plan details
    const planDoc = await adminDb.collection("plans").doc(planId).get();
    if (!planDoc.exists) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    const plan = planDoc.data()!;

    // 5. Update user subscription in Firestore
    const startDate = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (plan.duration || 30));

    const subscriptionData = {
      id: razorpay_subscription_id_fallback(razorpay_payment_id), // Use payment ID as a proxy if it's not a real Razorpay subscription object
      userId,
      planId,
      planName: plan.name,
      status: "active",
      startDate,
      expiresAt,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      amount: plan.price,
      currency: plan.currency || "INR",
    };

    // Save subscription document
    const subRef = adminDb.collection("subscriptions").doc();
    await subRef.set({ ...subscriptionData, id: subRef.id });

    // Update user profile with active subscription
    await adminDb.collection("users").doc(userId).update({
      subscription: {
        id: subRef.id,
        planId,
        planName: plan.name,
        status: "active",
        expiresAt,
      },
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Payment verification failed", details: error.message },
      { status: 500 }
    );
  }
}

function razorpay_subscription_id_fallback(paymentId: string) {
  return `sub_${paymentId}`;
}
