"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContactMessageProps {
  name: string;
  email: string;
  topic: string | null;
  message: string;
}

/** Truncated message preview that opens the full submission in a dialog. */
export function ContactMessage({
  name,
  email,
  topic,
  message,
}: ContactMessageProps) {
  const [open, setOpen] = useState(false);
  const isLong = message.length > 80;

  return (
    <div className="flex max-w-md flex-col items-start gap-1">
      <span className="line-clamp-2 text-sm">{message}</span>
      {isLong ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0"
          onClick={() => setOpen(true)}
        >
          Read full message
        </Button>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="text-muted-foreground size-4" aria-hidden />
              {topic || "Message"}
            </DialogTitle>
            <DialogDescription>
              From {name} · {email}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm whitespace-pre-wrap">{message}</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
