"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import dynamic from "next/dynamic";

// Lazy-load AuthProvider client-side only to prevent Firebase
// from being called during static page generation
const ClientAuthProvider = dynamic(
  () => import("@/hooks/useAuth").then((m) => ({ default: m.AuthProvider })),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ClientAuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            },
          }}
        />
      </ClientAuthProvider>
    </ThemeProvider>
  );
}
