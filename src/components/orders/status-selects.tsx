"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
} from "@/lib/constants";

interface StatusSelectProps {
  orderId: string;
  value: string;
  endpoint: string;
  fieldName: "status" | "paymentStatus";
  options: readonly string[];
  labels: Record<string, string>;
  ariaLabel: string;
}

/** Inline select that persists changes to the admin API immediately. */
function InlineStatusSelect({
  orderId,
  value,
  endpoint,
  fieldName,
  options,
  labels,
  ariaLabel,
}: StatusSelectProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [isPending, setIsPending] = useState(false);

  async function update(next: string) {
    if (next === current) return;
    setIsPending(true);
    try {
      const response = await fetch(endpoint.replace(":id", orderId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [fieldName]: next }),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        toast.error(body?.message ?? "Something went wrong.");
        return;
      }
      setCurrent(next as typeof current);
      toast.success(body?.message ?? "Updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <Select
        value={current}
        onValueChange={(next) => void update(next)}
        disabled={isPending}
      >
        <SelectTrigger
          size="sm"
          className="w-36"
          aria-label={ariaLabel}
        >
          {labels[current]}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {labels[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isPending ? (
        <LoaderCircle
          className="text-muted-foreground absolute right-8 size-3.5 animate-spin"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function OrderStatusSelect(props: {
  orderId: string;
  value: (typeof ORDER_STATUSES)[number];
}) {
  return (
    <InlineStatusSelect
      {...props}
      endpoint="/api/admin/orders/:id/status"
      fieldName="status"
      options={ORDER_STATUSES}
      labels={ORDER_STATUS_LABELS}
      ariaLabel="Update order status"
    />
  );
}

export function PaymentStatusSelect(props: {
  orderId: string;
  value: (typeof PAYMENT_STATUSES)[number];
}) {
  return (
    <InlineStatusSelect
      {...props}
      endpoint="/api/admin/orders/:id/payment"
      fieldName="paymentStatus"
      options={PAYMENT_STATUSES}
      labels={PAYMENT_STATUS_LABELS}
      ariaLabel="Update COD payment status"
    />
  );
}
