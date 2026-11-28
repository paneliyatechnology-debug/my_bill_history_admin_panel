"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function SuperAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SuperAdmin Console Error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm">
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
        SuperAdmin Operation Error
      </h1>

      <p className="text-xs text-slate-500 mt-1.5 max-w-md">
        An error occurred while executing an administrative operations view. You can retry the operation or return to the business dashboard.
      </p>

      {error?.message && (
        <div className="mt-4 p-3 bg-white border border-[#E5E7EB] rounded-xl text-left text-xs tabular-nums text-rose-600 max-w-md w-full break-words">
          {error.message}
        </div>
      )}

      <div className="flex items-center gap-3 mt-6">
        <button
          onClick={() => reset()}
          className="py-2.5 px-5 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          Retry Operation
        </button>

        <Link
          href="/"
          className="py-2.5 px-5 bg-white border border-[#E5E7EB] hover:bg-slate-50 text-[#344054] rounded-xl text-xs font-semibold transition-all"
        >
          ← Business Dashboard
        </Link>
      </div>
    </div>
  );
}
