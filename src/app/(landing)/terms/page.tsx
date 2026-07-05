export default function TermsPage() {
  return (
    <div className="min-h-screen py-32 px-4 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">Terms and Conditions</h1>
        <p className="text-muted-foreground text-sm">Last updated: July 5, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
        <p>
          Welcome to <strong>TestNova</strong>! These terms and conditions outline the rules and regulations for the use of TestNova&apos;s CBT Portal, operated by <strong>PihNexa Technologies</strong>.
        </p>
        <p>
          By accessing this website, we assume you accept these terms and conditions. Do not continue to use TestNova if you do not agree to take all of the terms and conditions stated on this page.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. License & Intellectual Property</h2>
        <p>
          Unless otherwise stated, PihNexa Technologies and/or its licensors own the intellectual property rights for all material on TestNova. All intellectual property rights are reserved. You may access this from TestNova for your own personal use subjected to restrictions set in these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Republish material, mock papers, or questions from TestNova.</li>
          <li>Sell, rent, or sub-license questions or explanations from TestNova.</li>
          <li>Reproduce, duplicate, or copy study plans or design templates from TestNova.</li>
          <li>Redistribute content from TestNova (unless content is specifically made for redistribution).</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Account Responsibility & Security</h2>
        <p>
          To access certain features (such as taking exam mocks and tracking progress), you are required to register for an account. You agree to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate, current, and complete credentials during signup.</li>
          <li>Maintain the security of your password and accept all risks of unauthorized access to your account.</li>
          <li>Promptly notify us at <strong>info@pihnexa.co.in</strong> if you discover or suspect any security breaches related to the portal.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Proctoring & Fair Use Policies</h2>
        <p>
          Our CBT engine employs anti-cheat proctoring metrics (such as detecting tab switching, exits from fullscreen, or minimizing the exam window) to preserve the validity of test reports. We reserve the right to temporarily suspend accounts or invalidate results if user logs indicate systematic attempts to cheat, scrape, or extract question bank contents.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Payment & Subscriptions</h2>
        <p>
          Access to premium mock papers requires active subscriptions. Payment processing, orders, and signatures are handled via our integration partner, Razorpay.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>All pricing plans are detailed clearly on our subscription catalog.</li>
          <li>Payments are subject to our Refund and Cancellation Policy (which allows cancelations within the specified grace period).</li>
          <li>Subscription packages are for individual preparation use only and cannot be shared or transferred.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Disclaimer (Non-Affiliation with Government)</h2>
        <p className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-yellow-200">
          <strong>IMPORTANT NOTICE:</strong> TestNova is an independent, private online preparation portal operated by PihNexa Technologies. We provide simulated mock tests, KaTeX explanations, and performance roadmaps for competitive exams. <strong>We are NOT affiliated with, sponsored by, or connected to any government organization, public sector commission, recruitment board, or official department.</strong> All materials are prepared independently for educational practice purposes.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">6. Contact Information</h2>
        <p>
          If you have any queries regarding any of our terms, please contact us:
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
