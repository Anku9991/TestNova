"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  );
}
