const currencyFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

/** Accepts numbers, numeric strings and Prisma Decimal-like values. */
type NumericLike = number | string | { toString(): string };

function toNumber(value: NumericLike): number {
  const amount =
    typeof value === "object" ? Number(value.toString()) : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function formatCurrency(value: NumericLike): string {
  return currencyFormatter.format(toNumber(value));
}

export function formatNumber(value: NumericLike): string {
  return numberFormatter.format(toNumber(value));
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(date: Date | string): string {
  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return dateTimeFormatter.format(new Date(date));
}
