"use client";

import { useState } from "react";

export default function DiagnosticPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (msg: string) => {
    setResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${msg}`,
    ]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    addResult("📱 Device Info:");
    addResult(`  User Agent: ${navigator.userAgent}`);
    addResult(`  Online: ${navigator.onLine}`);
    addResult(
      `  Connection: ${
        (navigator as any).connection?.effectiveType || "unknown"
      }`
    );

    const apiBase = "https://cashier-api.faizlzm.com";

    // Test 1: Simple fetch to health endpoint
    addResult("\n🔍 Test 1: GET /health");
    try {
      const start = Date.now();
      const r = await fetch(`${apiBase}/health`);
      const data = await r.json();
      addResult(`  ✅ Status: ${r.status} (${Date.now() - start}ms)`);
      addResult(`  ✅ Response: ${JSON.stringify(data)}`);
    } catch (e: any) {
      addResult(`  ❌ Error: ${e.name} - ${e.message}`);
    }

    // Test 2: OPTIONS preflight
    addResult("\n🔍 Test 2: OPTIONS /api/auth/login");
    try {
      const start = Date.now();
      const r = await fetch(`${apiBase}/api/auth/login`, {
        method: "OPTIONS",
        headers: {
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      });
      addResult(`  ✅ Status: ${r.status} (${Date.now() - start}ms)`);
      addResult(
        `  Allow-Methods: ${r.headers.get("access-control-allow-methods")}`
      );
      addResult(
        `  Allow-Origin: ${r.headers.get("access-control-allow-origin")}`
      );
    } catch (e: any) {
      addResult(`  ❌ Error: ${e.name} - ${e.message}`);
    }

    // Test 3: POST without credentials
    addResult("\n🔍 Test 3: POST /api/auth/login (tanpa credentials)");
    try {
      const start = Date.now();
      const r = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "test" }),
      });
      const data = await r.json();
      addResult(`  ✅ Status: ${r.status} (${Date.now() - start}ms)`);
      addResult(`  ✅ Response: ${JSON.stringify(data)}`);
    } catch (e: any) {
      addResult(`  ❌ Error: ${e.name} - ${e.message}`);
    }

    // Test 4: POST with credentials
    addResult(
      "\n🔍 Test 4: POST /api/auth/login (dengan credentials: include)"
    );
    try {
      const start = Date.now();
      const r = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@test.com", password: "test" }),
        credentials: "include",
      });
      const data = await r.json();
      addResult(`  ✅ Status: ${r.status} (${Date.now() - start}ms)`);
      addResult(`  ✅ Response: ${JSON.stringify(data)}`);
    } catch (e: any) {
      addResult(`  ❌ Error: ${e.name} - ${e.message}`);
    }

    // Test 5: Check Service Worker
    addResult("\n🔍 Test 5: Service Worker Status");
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        addResult(`  SW Count: ${regs.length}`);
        for (const reg of regs) {
          addResult(`  Scope: ${reg.scope}`);
          addResult(`  State: ${reg.active?.state || "no active"}`);
        }
      } else {
        addResult(`  SW not supported`);
      }
    } catch (e: any) {
      addResult(`  ❌ Error: ${e.message}`);
    }

    // Test 6: Check localStorage
    addResult("\n🔍 Test 6: Storage Check");
    try {
      const token = localStorage.getItem("cashier_access_token");
      addResult(`  Token exists: ${!!token}`);
      addResult(
        `  API URL env: ${process.env.NEXT_PUBLIC_API_URL || "not set"}`
      );
    } catch (e: any) {
      addResult(`  ❌ Error: ${e.message}`);
    }

    addResult("\n✅ Diagnostik selesai!");
    setIsRunning(false);
  };

  const copyResults = () => {
    navigator.clipboard.writeText(results.join("\n"));
    alert("Hasil disalin ke clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-white text-center mb-4">
          🔧 Network Diagnostic
        </h1>

        <div className="space-y-2 mb-4">
          <button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isRunning ? "⏳ Running..." : "▶️ Jalankan Diagnostik"}
          </button>

          <button
            onClick={copyResults}
            disabled={results.length === 0}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-600"
          >
            📋 Salin Hasil
          </button>

          <a
            href="/login"
            className="block w-full bg-gray-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-gray-700"
          >
            ← Kembali ke Login
          </a>
        </div>

        <div className="bg-black rounded-lg p-4 h-96 overflow-y-auto font-mono text-xs">
          {results.length === 0 ? (
            <p className="text-gray-500">
              Klik "Jalankan Diagnostik" untuk mulai testing...
            </p>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                className={
                  r.includes("❌")
                    ? "text-red-400"
                    : r.includes("✅")
                    ? "text-green-400"
                    : "text-gray-300"
                }
              >
                {r}
              </div>
            ))
          )}
        </div>

        <p className="text-gray-500 text-xs mt-4 text-center">
          Jalankan ini dari HP dan salin hasilnya untuk debugging.
        </p>
      </div>
    </div>
  );
}
