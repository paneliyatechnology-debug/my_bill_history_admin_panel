"use client";

import React, { useState } from "react";

export interface TenantDeleteItem {
  id: string;
  name: string;
  phone: string;
  companyCount?: number;
  invoiceCount?: number;
}

interface TenantDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  tenants: TenantDeleteItem[];
  isDeleting: boolean;
  lang?: "en" | "gu";
}

export function TenantDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  tenants,
  isDeleting,
  lang = "en",
}: TenantDeleteModalProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const isMultiple = tenants.length > 1;
  const requiresTypeConfirmation = isMultiple || tenants.some((t) => (t.invoiceCount || 0) > 0);

  const isConfirmed = requiresTypeConfirmation
    ? confirmInput.trim().toUpperCase() === "DELETE"
    : true;

  if (!isOpen || tenants.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={() => {
          if (!isDeleting) onClose();
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 bg-white rounded-2xl w-full max-w-lg text-slate-800 shadow-2xl border border-rose-200 max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">
              🗑️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {isMultiple
                  ? lang === "gu"
                    ? `${tenants.length} સંસ્થાઓ / ટેનન્ટ કાઢી નાખો`
                    : `Delete ${tenants.length} Tenants Permanently`
                  : lang === "gu"
                  ? "ટેનન્ટ કાયમ માટે કાઢી નાખો"
                  : "Delete Tenant Permanently"}
              </h3>
              <p className="text-xs text-rose-100">
                {lang === "gu"
                  ? "આ ક્રિયા કાયમી છે અને પાછી વાળી શકાતી નથી"
                  : "This action is destructive and irreversible"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Warning Message */}
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-rose-800">
              <span>⚠️</span>
              <span>
                {lang === "gu"
                  ? "ચેતવણી: સંબંધિત તમામ ડેટા કાયમ માટે નાશ પામશે!"
                  : "Warning: All associated records will be wiped completely!"}
              </span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5 text-rose-700">
              <li>
                {lang === "gu"
                  ? "સંસ્થાની કંપનીઓ, શાખાઓ અને વેરહાઉસ"
                  : "All companies, branches, and warehouses"}
              </li>
              <li>
                {lang === "gu"
                  ? "તમામ વેચાણ/ખરીદી ઇન્વૉઇસ, રિટર્ન, વાઉચર્સ અને લેજર્સ"
                  : "All sales invoices, purchase invoices, vouchers, and ledgers"}
              </li>
              <li>
                {lang === "gu"
                  ? "વપરાશકર્તાઓના ખાતા અને લૉગિન ઓળખપત્રો"
                  : "All registered users, credentials, and audit trails"}
              </li>
              <li>
                {lang === "gu"
                  ? "સક્રિય સપોર્ટ સત્રો તરત જ રદ થશે"
                  : "All active support sessions terminated immediately"}
              </li>
            </ul>
          </div>

          {/* Tenants preview list */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {lang === "gu" ? "કાઢી નાખવા માટે પસંદ કરેલ સંસ્થાઓ:" : "Target Tenants to Remove:"}
            </label>
            <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-slate-50 border border-slate-200 rounded-xl">
              {tenants.map((t) => (
                <div key={t.id} className="p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{t.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      ID: {t.id} • {t.phone}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    {t.companyCount !== undefined && (
                      <div>
                        {t.companyCount} Comp • {t.invoiceCount || 0} Inv
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Input if required */}
          {requiresTypeConfirmation && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-bold text-slate-700">
                {lang === "gu" ? (
                  <>
                    પુષ્ટિ કરવા માટે નીચેના ખાનામાં{" "}
                    <span className="text-rose-600 font-mono font-extrabold">DELETE</span> લખો:
                  </>
                ) : (
                  <>
                    Type <span className="text-rose-600 font-mono font-extrabold">DELETE</span> to
                    confirm permanent removal:
                  </>
                )}
              </label>
              <input
                type="text"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder="DELETE"
                autoFocus
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold tracking-widest text-rose-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {lang === "gu" ? "રદ કરો" : "Cancel"}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!isConfirmed || isDeleting}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{lang === "gu" ? "કાઢી રહ્યું છે..." : "Deleting..."}</span>
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>
                  {isMultiple
                    ? lang === "gu"
                      ? `${tenants.length} સંસ્થાઓ કાયમ માટે કાઢી નાખો`
                      : `Permanently Delete ${tenants.length} Tenants`
                    : lang === "gu"
                    ? "કાયમ માટે કાઢી નાખો"
                    : "Permanently Delete Tenant"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
