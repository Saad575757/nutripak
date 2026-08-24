import { Suspense } from "react";
import type { Metadata } from "next";
import { LoaderCircle } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
};

export default function AdminLoginPage() {
  return (
    <main className="bg-background flex min-h-svh items-center justify-center px-4 py-10">
      <Suspense
        fallback={
          <LoaderCircle
            className="text-muted-foreground size-6 animate-spin"
            aria-label="Loading sign in form"
          />
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
