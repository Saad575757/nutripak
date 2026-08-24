import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <DashboardShell user={{ name: session.name, email: session.email }}>
      {children}
    </DashboardShell>
  );
}
