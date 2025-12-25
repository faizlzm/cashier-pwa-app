"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <Card className="w-full max-w-[400px] shadow-xl glass border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
        <p className="text-sm text-muted-foreground">
          Mulai perjalanan bisnis Anda bersama kami
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              id="name"
              type="text"
              placeholder="Nama Lengkap"
              required
              icon={<User className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="email"
              type="email"
              placeholder="Email"
              required
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              required
              icon={<Lock className="h-4 w-4" />}
            />
          </div>
          <div className="space-y-2">
            <Input
              id="confirm-password"
              type="password"
              placeholder="Konfirmasi Password"
              required
              icon={<Lock className="h-4 w-4" />}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Daftar Sekarang
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Masuk
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
