"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  if (isSent) {
    return (
      <Card className="w-full max-w-[400px] shadow-xl glass border-white/20 text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl">Email Terkirim</CardTitle>
          <p className="text-muted-foreground mt-2">
            Silakan cek email Anda untuk instruksi reset password.
          </p>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Kembali ke Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[400px] shadow-xl glass border-white/20">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-medium text-muted-foreground">
            Kembali
          </span>
        </div>
        <CardTitle className="text-2xl font-bold">Lupa Password?</CardTitle>
        <p className="text-sm text-muted-foreground">
          Masukkan email Anda untuk reset password
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email terdaftar"
              required
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Kirim Link Reset
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
