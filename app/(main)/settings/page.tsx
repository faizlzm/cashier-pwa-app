"use client";

import { useState, useEffect } from "react";
import { User, Lock, Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/context/auth-context";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold tracking-tight">Pengaturan</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Profil Pengguna
          </CardTitle>
          <CardDescription>Informasi akun anda saat ini</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input value={user?.name || ""} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={user?.email || ""} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input value={user?.role || ""} readOnly className="bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" /> Tampilan Aplikasi
          </CardTitle>
          <CardDescription>
            Sesuaikan tampilan aplikasi dengan preferensi anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-medium">Mode Gelap</h3>
              <p className="text-sm text-muted-foreground">
                Aktifkan mode gelap untuk kenyamanan mata
              </p>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="w-[100px]"
            >
              {isDark ? (
                <>
                  <Sun className="mr-2 h-4 w-4" /> Light
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" /> Dark
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Keamanan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline">Ubah Password</Button>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button
          variant="destructive"
          className="w-full md:w-auto"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" /> Keluar Aplikasi
        </Button>
      </div>
    </div>
  );
}
