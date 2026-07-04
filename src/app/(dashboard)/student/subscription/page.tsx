"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Shield, Zap, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import Script from "next/script";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  duration: number;
  features: string[];
  isPopular: boolean;
}

export default function SubscriptionPage() {
  const { user, userProfile } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const q = query(collection(db, "plans"), where("isActive", "==", true));
        const snapshot = await getDocs(q);
        const fetchedPlans: Plan[] = [];
        snapshot.forEach((doc) => {
          fetchedPlans.push({ id: doc.id, ...doc.data() } as Plan);
        });
        
        // Sort by price ascending in memory
        fetchedPlans.sort((a, b) => a.price - b.price);
        
        setPlans(fetchedPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load subscription plans.");
      } finally {
        setLoading(false);
      }
    };
    if (db) {
      fetchPlans();
    }
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast.error("You must be logged in to subscribe.");
      return;
    }
    setProcessingId(plan.id);

    try {
      // 1. Get token
      const token = await user.getIdToken();

      // 2. Create Order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "TestNova",
        description: `Subscription: ${plan.name}`,
        order_id: data.orderId,
        handler: async function (response: any) {
          try {
            // 4. Verify payment
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");

            toast.success("Subscription activated successfully! 🎉");
            // Optional: refresh page to update state
            window.location.reload();
          } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Payment verification failed");
          }
        },
        prefill: {
          name: userProfile?.name || "",
          email: userProfile?.email || "",
        },
        theme: {
          color: "#3949ab",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const activeSubscription = userProfile?.subscription;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Upgrade Your Preparation
        </h1>
        <p className="text-muted-foreground">
          Unlock premium mock tests, advanced analytics, and AI-powered study planners
          to maximize your chances of success.
        </p>
      </motion.div>

      {/* Current Plan Status */}
      {activeSubscription && activeSubscription.status === "active" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card bg-gradient-to-r from-green-500/20 to-primary-500/10 border-green-500/30 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Active Subscription: {activeSubscription.planName}</h3>
            <p className="text-sm text-muted-foreground">
              Valid until: {new Date(activeSubscription.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`card relative flex flex-col ${
              plan.isPopular ? "border-primary-500 shadow-glow" : ""
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3" /> Most Popular
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-display text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground min-h-[40px]">{plan.description}</p>
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-2 mb-1">
                <span className="font-display text-4xl font-bold">
                  {plan.currency === "INR" ? "₹" : "$"}{plan.price}
                </span>
                <span className="text-muted-foreground mb-1">/{plan.duration === 30 ? "mo" : plan.duration === 365 ? "yr" : `${plan.duration} days`}</span>
              </div>
              {plan.originalPrice && (
                <div className="text-sm text-muted-foreground line-through">
                  {plan.currency === "INR" ? "₹" : "$"}{plan.originalPrice}
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={processingId === plan.id || (activeSubscription?.planId === plan.id && activeSubscription.status === "active")}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                plan.isPopular
                  ? "bg-primary-600 hover:bg-primary-500 text-white"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {processingId === plan.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : activeSubscription?.planId === plan.id && activeSubscription.status === "active" ? (
                "Current Plan"
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Select Plan
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8">
        <Shield className="w-4 h-4" />
        Secure payments powered by Razorpay. 100% safe & encrypted.
      </div>
    </div>
  );
}
