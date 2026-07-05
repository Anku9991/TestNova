export default function RefundPage() {
  return (
    <div className="min-h-screen py-32 px-4 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">Cancellation & Refund Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: July 5, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
        <p>
          At <strong>TestNova</strong>, operated by <strong>PihNexa Technologies</strong>, we strive to provide the best mock test preparation resources to our students. Please read our Cancellation and Refund Policy carefully to understand your rights and options regarding subscription plans.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Subscription Cancellation</h2>
        <p>
          You may cancel your premium test preparation subscription at any time directly through your Student Profile dashboard or by contacting our support team at <strong>info@pihnexa.co.in</strong>. 
        </p>
        <p>
          Upon cancellation, your subscription access will continue until the end of your current billing cycle (e.g. 30 days for Monthly plans), after which it will automatically terminate and revert to the free plan access tier.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Refund Eligibility & Window</h2>
        <p>
          We offer a <strong>7-Day Money-Back Guarantee</strong> on all our subscription packages. If you are not satisfied with our mock tests, CBT proctoring portal, or performance analysis features, you can request a full refund within <strong>7 days</strong> of your initial purchase date.
        </p>
        <p>
          <strong>Exceptions to Refund Eligibility:</strong>
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Refund requests submitted after 7 days from the transaction date are not eligible for a refund.</li>
          <li>If you have attempted more than 5 premium mock tests during the first 7 days, we reserve the right to decline the refund request to prevent fair use abuse.</li>
          <li>Renewals of recurring subscriptions are not eligible for refunds.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Refund Request Process</h2>
        <p>
          To request a refund under our 7-Day Money-Back Guarantee, please send an email to <strong>info@pihnexa.co.in</strong> with:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your registered email address.</li>
          <li>Your Razorpay payment transaction reference or order ID (e.g. `pay_...` or `order_...`).</li>
          <li>A brief explanation of why you are requesting a refund (this helps us improve our test papers!).</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Processing & Settlement Timeline</h2>
        <p>
          Once your refund request is received and verified:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>We will approve or decline the refund via email notification within <strong>24-48 business hours</strong>.</li>
          <li>If approved, the refund will be automatically processed back to your original payment method (Credit/Debit Card, UPI, Netbanking).</li>
          <li>According to standard banking channels and Razorpay settlement protocols, refunds typically take <strong>5 to 7 business days</strong> to reflect in your bank account or card statement.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Contact Customer Care</h2>
        <p>
          If you have any questions or require immediate support with a payment or refund query:
        </p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-2 mt-4">
          <p className="text-white font-semibold">PihNexa Technologies (Operating TestNova)</p>
          <p><strong>Address:</strong> Lucknow, Uttar Pradesh, India</p>
          <p><strong>Email:</strong> info@pihnexa.co.in</p>
          <p><strong>Phone:</strong> +91 7992203671</p>
        </div>
      </div>
    </div>
  );
}
