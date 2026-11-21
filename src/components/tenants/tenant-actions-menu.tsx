"use client";

import React, { useState, useRef, useEffect } from "react";

interface TenantActionsMenuProps {
  tenant: any;
  onViewDetails: (tenantId: string) => void;
  onManageLicense: (tenant: any) => void;
  onToggleStatus: (tenant: any) => void;
  onDeleteTenant: (tenant: any) => void;
  onEnterPortal?: (companyId: string, companyName: string) => void;
  onEditTenant?: (tenant: any) => void;
  lang?: "en" | "gu";
}

export function TenantActionsMenu({
  tenant,
  onViewDetails,
  onManageLicense,
  onToggleStatus,
  onDeleteTenant,
  onEnterPortal,
  onEditTenant,
  lang = "en",
}: TenantActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const firstCompany = (tenant.organizations || [])
    .flatMap((o: any) => o.companies || [])
    .find(Boolean);

  const isMasterTenant =
    tenant.id === "3ecc34a6-da03-4a23-a2f9-c3c662b62327" ||
    tenant.primaryPhone === "9999900000" ||
    tenant.primaryEmail === "superadmin@billing.local";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap" ref={menuRef}>
      {/* Quick Action: Enter Portal if company exists */}
      {firstCompany && onEnterPortal && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEnterPortal(firstCompany.id, firstCompany.tradeName);
          }}
          className="px-2.5 py-1 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
          title="Enter tenant portal in support mode"
        >
          <span>{lang === "gu" ? "પોર્ટલ" : "Portal"}</span>
          <span>→</span>
        </button>
      )}

      {/* Quick Action: Edit Tenant */}
      {onEditTenant && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditTenant(tenant);
          }}
          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          title="Edit Tenant Details"
        >
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>{lang === "gu" ? "એડિટ" : "Edit"}</span>
        </button>
      )}

      {/* Quick Action: Manage License */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onManageLicense(tenant);
        }}
        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1677E8] border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
        title="Manage License & Validity"
      >
        {lang === "gu" ? "લાઇસન્સ" : "License"}
      </button>

      {/* Modern Options Dropdown Menu Button */}
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer ${isOpen ? "bg-slate-100 ring-2 ring-blue-100 border-blue-300" : ""
            }`}
          title="More Options"
        >
          <span>{lang === "gu" ? "વિકલ્પો" : "Options"}</span>
          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu Popup */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-xs">
            {/* Edit Tenant Details */}
            {onEditTenant && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onEditTenant(tenant);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-blue-50 text-blue-700 flex items-center gap-2 cursor-pointer font-bold transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <span>{lang === "gu" ? "ટેનન્ટ એડિટ કરો" : "Edit Tenant Details"}</span>
              </button>
            )}

            {/* View Details */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onViewDetails(tenant.id);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{lang === "gu" ? "સંપૂર્ણ વિગતો જુઓ" : "View Full Details"}</span>
            </button>

            {/* Manage License */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onManageLicense(tenant);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span>{lang === "gu" ? "લાઇસન્સ અને પ્લાન" : "Manage License"}</span>
            </button>

            {/* Toggle Status */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onToggleStatus(tenant);
              }}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium transition-colors"
            >
              {tenant.isActive ? (
                <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>
                {tenant.isActive
                  ? lang === "gu"
                    ? "ટેનન્ટ સ્થગિત કરો"
                    : "Suspend Tenant"
                  : lang === "gu"
                    ? "ટેનન્ટ સક્રિય કરો"
                    : "Activate Tenant"}
              </span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {isMasterTenant ? (
              <div className="w-full text-left px-3.5 py-2 text-slate-400 flex items-center gap-2 cursor-not-allowed text-[11px] font-medium bg-slate-50 select-none">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>{lang === "gu" ? "મુખ્ય (સુરક્ષિત)" : "Protected Platform"}</span>
              </div>
            ) : (
              /* Delete Tenant */
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onDeleteTenant(tenant);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-semibold transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{lang === "gu" ? "ટેનન્ટ કાઢી નાખો" : "Delete Tenant"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
