"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged server-side for diagnosis; never surfaced to the user.
    console.error("[admin] Route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="bg-danger-soft text-danger-text flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground mt-1 max-w-md text-sm">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <Button onClick={reset}>
          <RefreshCw className="size-4" aria-hidden /> Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
      </div>
      {error.digest ? (
        <p className="text-muted-foreground mt-4 font-mono text-xs">
          Error reference: {error.digest}
        </p>
      ) : null}
    </div>
  );
}
