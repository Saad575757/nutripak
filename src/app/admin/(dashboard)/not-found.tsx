import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
        <SearchX className="size-6" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Page not found</h2>
      <p className="text-muted-foreground mt-1 max-w-md text-sm">
        The page you are looking for doesn&apos;t exist or may have been moved.
      </p>
      <Button asChild className="mt-6">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
