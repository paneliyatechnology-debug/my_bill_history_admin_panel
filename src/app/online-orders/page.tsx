"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnlineOrdersRedirect() {
  const router = useRouter();

  useEffect(() => {
    // If accessed on superadmin port (3001), redirect to SME portal (3000) or superadmin
    if (typeof window !== "undefined") {
      const port = window.location.port;
      if (port === "3001") {
        window.location.href = `${window.location.protocol}//${window.location.hostname}:3000/online-orders`;
      } else {
        router.push("/superadmin");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Opening Online Orders...</p>
      </div>
    </div>
  );
}
