import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | TestNova",
  description: "Sign in to your TestNova account and continue your government exam preparation.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center p-4">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        {children}
        <div className="text-center mt-6 text-xs text-white/40">
          Powered by{" "}
          <a
            href="https://pihnexa.co.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
          >
            PihNexa Technologies
          </a>
        </div>
      </div>
    </div>
  );
}
