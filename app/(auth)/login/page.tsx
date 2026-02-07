"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuth } from "@/lib/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Login gagal. Periksa email dan password Anda.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        setError(axiosError.response?.data?.message || errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-[400px] border-slate-200 bg-white shadow-xl">
        <CardContent className="pt-8 px-8 pb-8">
          <div className="flex flex-col items-center space-y-6 mb-8">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-slate-900">
                Masuk ke Akun Anda
              </h1>
              <p className="text-slate-500">
                Masukkan email dan password untuk masuk.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                key="login-error"
                className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                EMAIL
              </label>
              <Input
                id="email"
                data-testid="login-email-input"
                type="email"
                placeholder="admin@kasipro.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-4 w-4" />}
                iconPosition="left"
                className="bg-white border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                PASSWORD
              </label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="login-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="h-4 w-4" />}
                  iconPosition="left"
                  className="bg-white border-slate-300 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              className="w-full bg-blue-800 hover:bg-blue-900 h-11"
              isLoading={isLoading}
            >
              Masuk
            </Button>

            <div className="flex items-center justify-between text-sm pt-2"></div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
