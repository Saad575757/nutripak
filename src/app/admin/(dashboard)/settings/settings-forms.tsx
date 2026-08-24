"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { KeyRound, LoaderCircle, Monitor, Moon, Save, Sun, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  changePasswordSchema,
  profileSchema,
} from "@/validations/auth";

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      className="bg-danger-soft text-danger-text border-danger-border rounded-md border px-3 py-2 text-sm"
      role="alert"
    >
      {message}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-destructive text-xs" role="alert">
      {message}
    </p>
  );
}

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: { name: string; email: string };
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: { name: string; email: string }) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError("root", { message: body?.message ?? "Something went wrong." });
        return;
      }
      toast.success("Profile updated successfully.");
      router.refresh();
    } catch {
      setError("root", { message: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="size-4" aria-hidden /> Admin Profile
        </CardTitle>
        <CardDescription>
          Your name and email are shown in the dashboard header.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">
                Name <span aria-hidden>*</span>
              </Label>
              <Input
                id="profile-name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-email">
                Email <span aria-hidden>*</span>
              </Label>
              <Input
                id="profile-email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>
          </div>

          <FormError message={errors.root?.message} />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden /> Saving…
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden /> Save Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError("root", { message: body?.message ?? "Something went wrong." });
        return;
      }
      toast.success(body?.message ?? "Password changed successfully.");
      reset();
    } catch {
      setError("root", { message: "Something went wrong." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4" aria-hidden /> Change Password
        </CardTitle>
        <CardDescription>
          Use at least 8 characters with uppercase, lowercase and a number.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="current-password">
                Current Password <span aria-hidden>*</span>
              </Label>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                {...register("currentPassword")}
              />
              <FieldError message={errors.currentPassword?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">
                New Password <span aria-hidden>*</span>
              </Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
              />
              <FieldError message={errors.newPassword?.message} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">
                Confirm New Password <span aria-hidden>*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>
          </div>

          <FormError message={errors.root?.message} />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoaderCircle className="size-4 animate-spin" aria-hidden /> Updating…
              </>
            ) : (
              <>
                <KeyRound className="size-4" aria-hidden /> Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemePreference() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Preference</CardTitle>
        <CardDescription>
          Choose how the dashboard looks. The selection is remembered on this
          device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div role="radiogroup" aria-label="Theme" className="flex flex-wrap gap-2">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected =
              (theme ?? "system") === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "ring-offset-background focus-visible:ring-ring inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
                {option.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
