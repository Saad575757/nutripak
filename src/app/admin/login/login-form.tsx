"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Leaf, LoaderCircle } from "lucide-react";
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
import { APP_NAME } from "@/lib/constants";
import { loginSchema, type LoginInput } from "@/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setError("root", {
          message: body?.message ?? "Invalid email or password.",
        });
        return;
      }

      toast.success("Welcome back!");
      const from = searchParams.get("from");
      router.replace(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("root", {
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Link
          href="/admin/login"
          className="flex items-center gap-2.5"
          aria-label={`${APP_NAME} home`}
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="size-5" aria-hidden />
          </span>
          <span className="text-2xl font-bold tracking-tight">
            {APP_NAME}
            <span className="text-muted-foreground font-medium"> Admin</span>
          </span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Sign in to manage products, orders and inventory.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>
            Only authorised administrators can access this area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email <span aria-hidden>*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@nutripak.com"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  Password <span aria-hidden>*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-destructive text-xs" role="alert">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              {errors.root ? (
                <div
                  className="bg-danger-soft text-danger-text border-danger-border rounded-md border px-3 py-2 text-sm"
                  role="alert"
                >
                  {errors.root.message}
                </div>
              ) : null}

              <Button type="submit" disabled={isSubmitting} className="mt-1">
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" aria-hidden />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Cash on Delivery only · No online payments are processed by this system.
      </p>
    </div>
  );
}
