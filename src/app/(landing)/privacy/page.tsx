export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-32 px-4 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm">Last updated: July 5, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-muted-foreground space-y-6">
        <p>
          At <strong>TestNova</strong>, accessible from <a href="https://testnova7.vercel.app" className="text-primary-400 hover:underline">https://testnova7.vercel.app</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by TestNova and how we use it.
        </p>
        <p>
          If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>info@pihnexa.co.in</strong>.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>
          We collect personal information that you provide directly to us when registering for an account, purchasing subscription plans, or communicating with us. This includes:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Personal Identification Details:</strong> Name, email address, password, profile photo, and mobile number.</li>
          <li><strong>Billing Information:</strong> Payment transaction references, selected plan details, and subscription dates (please note: all raw payment details like card numbers are securely handled by our PCI-DSS compliant partner, Razorpay).</li>
          <li><strong>Activity Logs:</strong> Mock exam attempts, scores, selected answers, cheating/proctoring violation flags, and audit logs.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. How We Use Your Information</h2>
        <p>
          We use the information we collect in various ways, including to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide, operate, and maintain our CBT Exam Portal.</li>
          <li>Improve, personalize, and expand your experience on our platform.</li>
          <li>Analyze exam metrics to generate your AI-powered performance roadmaps.</li>
          <li>Process transactions and send subscription notifications.</li>
          <li>Communicate with you for customer support, system updates, and ticket resolution.</li>
          <li>Prevent fraud, enforce exam proctoring guidelines, and maintain system integrity.</li>
        </ul>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Log Files and Cookies</h2>
        <p>
          TestNova follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and number of clicks. These are not linked to any information that is personally identifiable.
        </p>
        <p>
          We also use cookies to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited, to optimize the user experience.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">4. Data Sharing and Security</h2>
        <p>
          We do not sell, trade, or rent your personal identification information to third parties. We share data only with trusted partners like:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Firebase (Google Cloud):</strong> For hosting database records, authentication states, and storage assets securely.</li>
          <li><strong>Razorpay:</strong> To process subscription checkouts and verify transaction signatures.</li>
        </ul>
        <p>
          We adopt appropriate data collection, storage, and processing practices and security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal data.
        </p>

        <h2 className="text-2xl font-bold text-white mt-8 mb-4">5. Contact Information</h2>
        <p>
          If you have any questions about this Privacy Policy or our practices, please contact us at:
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
