"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/providers/ToastProvider";
import { Lock } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { AppLogo } from "@/components/ui/AppLogo";
import { DeveloperCredit } from "@/components/layout/DeveloperCredit";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        showToast(result.error || "Login failed", "error");
        return;
      }

      showToast("Login successful", "success");
      router.push("/dashboard");
      router.refresh();
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 to-brand-900 p-12 flex-col justify-between text-white">
        <div className="flex items-center gap-4">
          <AppLogo size="sm" showFrame priority />
          <div>
            <h1 className="text-xl font-bold">{APP_NAME}</h1>
            <p className="text-brand-100 text-sm">Admin Portal</p>
          </div>
        </div>
        <div>
          <AppLogo size="xl" showFrame className="mx-auto mb-8 hidden lg:flex" priority />
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Manage Your Cricket Team Registrations
          </h2>
          <p className="text-brand-100 text-lg max-w-md">
            Register players, track categories, and manage your cricket organization with ease.
          </p>
        </div>
        <DeveloperCredit variant="brand" className="max-w-sm" />
      </div>

      <div className="flex flex-1 flex-col bg-[hsl(var(--background))]">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <AppLogo size="xs" showFrame priority />
            <h1 className="text-lg font-bold">{APP_NAME}</h1>
          </div>

          <div className="surface-card p-8 shadow-card-hover">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Sign In</h2>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Enter your admin credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Password"
                type="password"
                required
                autoComplete="current-password"
                {...register("password")}
                error={errors.password?.message}
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Sign In
              </Button>
            </form>
          </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-[hsl(var(--border))]/60 px-4 py-5 sm:px-6">
          <DeveloperCredit variant="dark" className="max-w-md mx-auto" compact />
        </footer>
      </div>
    </div>
  );
}
