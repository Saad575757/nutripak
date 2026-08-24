import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  ChangePasswordForm,
  ProfileForm,
  ThemePreference,
} from "./settings-forms";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireAdmin();
  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
    select: { name: true, email: true },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <ProfileForm
        defaultValues={{
          name: admin?.name ?? session.name,
          email: admin?.email ?? session.email,
        }}
      />
      <ChangePasswordForm />
      <ThemePreference />
    </div>
  );
}
