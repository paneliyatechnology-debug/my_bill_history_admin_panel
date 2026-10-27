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
          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
          title="Edit Tenant Details"
        >
          <span>✏️</span>
          <span>{lang === "gu" ? "એડિટ" : "Edit"}</span>
        </button>
      )}

      {/* Quick Action: Manage License */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onManageLicense(tenant);
        }}
        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
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
          className={`px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer ${
            isOpen ? "bg-slate-100 ring-2 ring-purple-100 border-purple-300" : ""
          }`}
          title="More Options"
        >
          <span>{lang === "gu" ? "વિકલ્પો" : "Options"}</span>
          <span className="text-[9px] text-slate-400">▼</span>
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
                <span className="text-sm">✏️</span>
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
              <span className="text-sm">🔍</span>
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
              <span className="text-sm">🔑</span>
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
              <span className="text-sm">{tenant.isActive ? "⏸️" : "▶️"}</span>
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
                <span className="text-sm">🛡️</span>
                <span>{lang === "gu" ? "મુખ્ય HQ (સુરક્ષિત)" : "Protected HQ Platform"}</span>
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
                <span className="text-sm">🗑️</span>
                <span>{lang === "gu" ? "ટેનન્ટ કાઢી નાખો" : "Delete Tenant"}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
