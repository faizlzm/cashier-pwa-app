"use client";

import { useEffect, useState } from "react";

export default function ResetPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const addStatus = (msg: string) => {
    setStatus((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const resetAll = async () => {
    addStatus("🚀 Memulai reset PWA...");

    // 1. Unregister all Service Workers
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        addStatus(`📋 Ditemukan ${registrations.length} Service Worker`);
        
        for (const registration of registrations) {
          await registration.unregister();
          addStatus(`✅ Unregistered: ${registration.scope}`);
        }
      }
    } catch (e) {
      addStatus(`❌ SW Error: ${e}`);
    }

    // 2. Clear all caches
    try {
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        addStatus(`📦 Ditemukan ${cacheNames.length} cache(s)`);
        
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          addStatus(`✅ Deleted cache: ${cacheName}`);
        }
      }
    } catch (e) {
      addStatus(`❌ Cache Error: ${e}`);
    }

    // 3. Clear IndexedDB
    try {
      const databases = await indexedDB.databases();
      addStatus(`💾 Ditemukan ${databases.length} IndexedDB`);
      
      for (const db of databases) {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
          addStatus(`✅ Deleted IndexedDB: ${db.name}`);
        }
      }
    } catch (e) {
      addStatus(`❌ IndexedDB Error: ${e}`);
    }

    // 4. Clear localStorage
    try {
      const count = localStorage.length;
      localStorage.clear();
      addStatus(`✅ Cleared ${count} localStorage items`);
    } catch (e) {
      addStatus(`❌ localStorage Error: ${e}`);
    }

    // 5. Clear sessionStorage
    try {
      const count = sessionStorage.length;
      sessionStorage.clear();
      addStatus(`✅ Cleared ${count} sessionStorage items`);
    } catch (e) {
      addStatus(`❌ sessionStorage Error: ${e}`);
    }

    // 6. Test API connection
    try {
      addStatus("🔄 Testing API connection...");
      const response = await fetch("https://cashier-api.faizlzm.com/health");
      const data = await response.json();
      addStatus(`✅ API Status: ${response.status} - ${data.status}`);
    } catch (e) {
      addStatus(`❌ API Error: ${e}`);
    }

    addStatus("🎉 Reset selesai! Silakan klik tombol untuk ke Login.");
    setIsComplete(true);
  };

  useEffect(() => {
    resetAll();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-indigo-600">
          🔄 PWA Reset Tool
        </h1>
        
        <div className="bg-gray-900 rounded-lg p-4 mb-4 h-64 overflow-y-auto font-mono text-sm">
          {status.map((s, i) => (
            <div key={i} className="text-green-400 mb-1">
              {s}
            </div>
          ))}
          {!isComplete && (
            <div className="text-yellow-400 animate-pulse">
              Processing...
            </div>
          )}
        </div>

        {isComplete && (
          <a
            href="/login"
            className="block w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            ➡️ Ke Halaman Login
          </a>
        )}

        <p className="text-gray-500 text-xs mt-4 text-center">
          Halaman ini menghapus semua cache PWA, Service Worker, dan data lokal
          untuk memperbaiki masalah koneksi.
        </p>
      </div>
    </div>
  );
}
