"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { apiClient } from "../../../lib/api-client";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";
import { TenantDeleteModal, TenantDeleteItem } from "../../../components/tenants/tenant-delete-modal";
import { TenantActionsMenu } from "../../../components/tenants/tenant-actions-menu";
import { TenantEditModal, EditTenantPayload } from "../../../components/tenants/tenant-edit-modal";
import SuperAdminLoading from "../loading";
import type { TenantItem } from "../../../shared-types/superadmin";

function SuperAdminTenantsContent() {
  const searchParams = useSearchParams();
  const {
    stats,
    refetchStats,
    lang,
    setIsCreateTenantOpen,
    setActionSuccess,
    setActionError,
    handleImpersonateTenant,
    getTierInfo,
    tenantRefreshTrigger,
    TIER_META,
  } = useSuperAdmin();

  // Data state
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters from query or state
  const initialTier = searchParams.get("tier") || "";
  const [tenantSearch, setTenantSearch] = useState("");
  const [tierFilter, setTierFilter] = useState(initialTier);
  const [tenantStatusFilter, setTenantStatusFilter] = useState("");

  // Modals state
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null);
  const [viewDetailsTenant, setViewDetailsTenant] = useState<any | null>(null);
  const [editTier, setEditTier] = useState<string>("TRIAL");
  const [extendDays, setExtendDays] = useState<number>(30);
  const [isUpdatingTenant, setIsUpdatingTenant] = useState(false);

  // Edit Tenant Modal
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [isEditingTenantSaving, setIsEditingTenantSaving] = useState(false);

  // Selection & Delete
  const [selectedTenantIds, setSelectedTenantIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [tenantsToDelete, setTenantsToDelete] = useState<TenantDeleteItem[]>([]);
  const [isDeletingTenants, setIsDeletingTenants] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Keep tier filter synced with query param if it changes
  useEffect(() => {
    const qTier = searchParams.get("tier");
    if (qTier !== null) {
      setTierFilter(qTier);
    }
  }, [searchParams]);

  // Fetch Tenants
  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      const data: any = await apiClient.get("/super-admin/tenants", {
        search: tenantSearch,
        tier: tierFilter,
        status: tenantStatusFilter,
        limit: 100,
      });
      setTenants(data?.data || []);
    } catch (err: any) {
      console.error("Failed to load tenants", err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantSearch, tierFilter, tenantStatusFilter]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants, tenantRefreshTrigger]);

  // Deep-linked edit tenant from URL (?editTenantId=...)
  useEffect(() => {
    const editTenantId = searchParams.get("editTenantId");
    if (editTenantId && !editingTenant) {
      const match = tenants.find((t) => t.id === editTenantId);
      if (match) {
        setEditingTenant(match);
      } else if (tenants.length > 0) {
        apiClient
          .get(`/super-admin/tenants/${editTenantId}`)
          .then((data: any) => {
            if (data) setEditingTenant(data);
          })
          .catch(() => {});
      }
    }
  }, [searchParams, tenants, editingTenant]);

  // View Deep Details
  const handleViewTenantDetails = useCallback(async (tenantId: string) => {
    try {
      const data: any = await apiClient.get(`/super-admin/tenants/${tenantId}`);
      if (data) {
        setViewDetailsTenant(data);
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to load tenant details");
    }
  }, [setActionError]);

  // Open Edit Tenant
  const handleOpenEditTenant = useCallback((tenant: any) => {
    setEditingTenant(tenant);
  }, []);

  const handleCloseEditTenant = useCallback(() => {
    setEditingTenant(null);
  }, []);

  // Save Edit Tenant
  const handleSaveEditTenant = async (payload: EditTenantPayload) => {
    if (!editingTenant) return;
    setIsEditingTenantSaving(true);
    setActionError(null);
    try {
      await apiClient.patch(`/super-admin/tenants/${editingTenant.id}`, payload);
      setActionSuccess(
        lang === "gu"
          ? "સંસ્થા/ટેનન્ટની વિગતો સફળતાપૂર્વક અપડેટ થઈ ગઈ!"
          : "Tenant profile updated successfully!"
      );
      setEditingTenant(null);
      await fetchTenants();
      refetchStats();
    } catch (err: any) {
      setActionError(err.message || "Failed to update tenant");
    } finally {
      setIsEditingTenantSaving(false);
    }
  };

  // Toggle Single Tenant Active / Inactive
  const handleToggleTenantStatus = useCallback(
    async (t: TenantItem) => {
      try {
        await apiClient.patch(`/super-admin/tenants/${t.id}`, {
          isActive: !t.isActive,
        });
        setActionSuccess(
          lang === "gu"
            ? `સંસ્થા ${t.primaryPhone} ની સ્થિતિ બદલાઈ ગઈ છે.`
            : `Tenant ${t.primaryPhone} status updated.`
        );
        fetchTenants();
        refetchStats();
      } catch (err: any) {
        setActionError(err.message || "Failed to update tenant status");
      }
    },
    [lang, fetchTenants, refetchStats, setActionSuccess, setActionError]
  );

  // Update Subscription Tier & Validity
  const handleUpdateTenantTier = async () => {
    if (!selectedTenant) return;
    setIsUpdatingTenant(true);
    setActionError(null);
    try {
      await apiClient.patch(`/super-admin/tenants/${selectedTenant.id}`, {
        subscriptionTier: editTier,
        extendDays: Number(extendDays),
      });
      setActionSuccess(
        lang === "gu"
          ? `સંસ્થા ${selectedTenant.primaryPhone} માટે સબ્સ્ક્રિપ્શન સફળતાપૂર્વક અપડેટ થઈ ગયું!`
          : `Subscription plan updated for ${selectedTenant.primaryPhone}!`
      );
      setSelectedTenant(null);
      await fetchTenants();
      refetchStats();
    } catch (err: any) {
      setActionError(err.message || "Failed to update tenant subscription");
    } finally {
      setIsUpdatingTenant(false);
    }
  };

  // Single Delete
  const handleOpenSingleDelete = useCallback(
    (tenant: TenantItem) => {
      const isMaster =
        tenant.id === "3ecc34a6-da03-4a23-a2f9-c3c662b62327" ||
        tenant.primaryPhone === "9999900000" ||
        tenant.primaryEmail === "superadmin@billing.local";

      if (isMaster) {
        setActionError(
          lang === "gu"
            ? "પસંદ કરેલ ટેનન્ટ મુખ્ય સુપરએડમિન ખાતું છે જેને કાઢી શકાતું નથી."
            : "The selected tenant is the Master SuperAdmin Platform account and cannot be deleted."
        );
        return;
      }

      const orgNames = (tenant.organizations || []).map((o) => o.name).filter(Boolean);
      const orgName = orgNames[0] || tenant.primaryPhone || tenant.id;
      const compCount = (tenant.organizations || []).reduce((s, o) => s + (o.companies?.length || 0), 0);
      const invCount = (tenant.organizations || []).reduce(
        (s, o) => s + (o.companies || []).reduce((cs, c) => cs + (c.invoicesCount || 0), 0),
        0
      );

      setTenantsToDelete([
        {
          id: tenant.id,
          name: orgName,
          phone: tenant.primaryPhone,
          companyCount: compCount,
          invoiceCount: invCount,
        },
      ]);
      setIsDeleteModalOpen(true);
    },
    [lang, setActionError]
  );

  // Bulk Delete
  const handleOpenBulkDelete = useCallback(() => {
    if (selectedTenantIds.size === 0) return;
    const targetItems: TenantDeleteItem[] = tenants
      .filter((t) => {
        const isMaster =
          t.id === "3ecc34a6-da03-4a23-a2f9-c3c662b62327" ||
          t.primaryPhone === "9999900000" ||
          t.primaryEmail === "superadmin@billing.local";
        return selectedTenantIds.has(t.id) && !isMaster;
      })
      .map((t) => {
        const orgNames = (t.organizations || []).map((o) => o.name).filter(Boolean);
        const orgName = orgNames[0] || t.primaryPhone || t.id;
        const compCount = (t.organizations || []).reduce((s, o) => s + (o.companies?.length || 0), 0);
        const invCount = (t.organizations || []).reduce(
          (s, o) => s + (o.companies || []).reduce((cs, c) => cs + (c.invoicesCount || 0), 0),
          0
        );
        return {
          id: t.id,
          name: orgName,
          phone: t.primaryPhone,
          companyCount: compCount,
          invoiceCount: invCount,
        };
      });

    if (targetItems.length === 0) {
      setActionError(
        lang === "gu"
          ? "પસંદ કરેલ ટેનન્ટ મુખ્ય સુપરએડમિન ખાતું છે જેને કાઢી શકાતું નથી."
          : "The selected tenant is the Master SuperAdmin Platform account and cannot be deleted."
      );
      return;
    }

    setTenantsToDelete(targetItems);
    setIsDeleteModalOpen(true);
  }, [selectedTenantIds, tenants, lang, setActionError]);

  // Confirm Delete (Single or Bulk)
  const handleConfirmDelete = async () => {
    if (!tenantsToDelete.length) return;
    setIsDeletingTenants(true);
    setActionError(null);
    try {
      const ids = tenantsToDelete.map((t) => t.id);
      if (ids.length === 1) {
        await apiClient.delete(`/super-admin/tenants/${ids[0]}`);
      } else {
        await apiClient.post("/super-admin/tenants/bulk-delete", { tenantIds: ids });
      }

      setActionSuccess(
        lang === "gu"
          ? `${ids.length} સંસ્થા/ટેનન્ટ સફળતાપૂર્વક કાઢી નાખ્યા!`
          : `Successfully deleted ${ids.length} tenant(s)!`
      );
      setSelectedTenantIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setIsDeleteModalOpen(false);
      setTenantsToDelete([]);
      await fetchTenants();
      refetchStats();
    } catch (err: any) {
      setActionError(err.message || "Failed to delete tenant(s)");
    } finally {
      setIsDeletingTenants(false);
    }
  };

  // Bulk Status Update (Activate / Suspend)
  const handleBulkStatusUpdate = async (isActive: boolean) => {
    if (selectedTenantIds.size === 0) return;
    setIsBulkUpdating(true);
    setActionError(null);
    try {
      const ids = Array.from(selectedTenantIds);
      await apiClient.post("/super-admin/tenants/bulk-status", {
        tenantIds: ids,
        isActive,
      });

      setActionSuccess(
        lang === "gu"
          ? `${ids.length} સંસ્થાઓ સફળતાપૂર્વક ${isActive ? "સક્રિય" : "સ્થગિત"} કરવામાં આવી!`
          : `Successfully updated ${ids.length} tenant(s) to ${isActive ? "Active" : "Suspended"}!`
      );
      await fetchTenants();
      refetchStats();
    } catch (err: any) {
      setActionError(err.message || "Failed to update tenants status");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Table Columns
  const tenantColumns: ColumnDef<TenantItem>[] = useMemo(
    () => [
      {
        id: "organization",
        header: lang === "gu" ? "સંસ્થા / સંચાલક" : "ORGANIZATION / TENANT",
        sortable: true,
        headerClassName: "min-w-[210px]",
        className: "min-w-[210px]",
        accessorFn: (t) => {
          const names = (t.organizations || []).map((o) => o.name).filter(Boolean);
          return names.join(", ") || t.primaryPhone || t.id;
        },
        cell: (t) => {
          const orgNames = (t.organizations || []).map((o) => o.name).filter(Boolean);
          const primaryOrgName = orgNames[0] || (lang === "gu" ? "અનામી સંસ્થા" : "Unnamed Organization");
          const extraCount = orgNames.length > 1 ? orgNames.length - 1 : 0;

          const words = primaryOrgName.trim().split(/\s+/);
          const initials =
            words.length >= 2 && words[0] && words[1]
              ? (words[0][0] + words[1][0]).toUpperCase()
              : primaryOrgName.slice(0, 2).toUpperCase() || "TN";

          return (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 text-xs truncate max-w-[190px] xl:max-w-[240px]" title={primaryOrgName}>
                  <span>{primaryOrgName}</span>
                  {extraCount > 0 && (
                    <span className="ml-1 text-[10px] text-purple-600 font-semibold">
                      (+{extraCount})
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate max-w-[190px] xl:max-w-[240px]" title={t.id}>
                  {t.id}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "contact",
        header: lang === "gu" ? "પ્રાથમિક સંપર્ક" : "PRIMARY CONTACT",
        sortable: true,
        accessorKey: "primaryPhone",
        cell: (t) => (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{t.primaryPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono truncate max-w-[180px]">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">
                {t.primaryEmail ? t.primaryEmail : <span className="text-slate-300 font-sans">—</span>}
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "planTier",
        header: lang === "gu" ? "પ્લાન ટિયર" : "PLAN TIER",
        sortable: true,
        accessorKey: "subscriptionTier",
        cell: (t) => {
          const meta = getTierInfo(t.subscriptionTier);
          return (
            <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase font-mono border tracking-wider shadow-2xs ${meta.badgeStyle}`}>
              {t.subscriptionTier}
            </span>
          );
        },
      },
      {
        id: "expiryDate",
        header: lang === "gu" ? "સમાપ્તિ તારીખ" : "EXPIRY DATE",
        sortable: true,
        accessorKey: "subscriptionEnds",
        cell: (t) => {
          const d = new Date(t.subscriptionEnds);
          const formattedDate = isNaN(d.getTime())
            ? "—"
            : `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
          const isExpired = d.getTime() < Date.now();
          const daysLeft = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const subtitle = isExpired
            ? lang === "gu"
              ? "સમાપ્ત (Expired)"
              : "Expired"
            : lang === "gu"
              ? `${daysLeft} દિવસ બાકી`
              : `${daysLeft} days left`;

          return (
            <div>
              <div className={`text-xs font-bold font-mono ${isExpired ? "text-rose-600" : "text-slate-800"}`}>
                {formattedDate}
              </div>
              <div
                className={`text-[10px] font-semibold mt-0.5 ${
                  isExpired ? "text-rose-500" : daysLeft <= 15 ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {subtitle}
              </div>
            </div>
          );
        },
      },
      {
        id: "companies",
        header: lang === "gu" ? "કંપનીઓ અને બિલ" : "COMPANIES & INVOICES",
        sortable: false,
        cell: (t) => {
          const totalCompanies = (t.organizations || []).reduce((sum, org) => sum + (org.companies?.length || 0), 0);
          const totalInvoices = (t.organizations || []).reduce(
            (sum, org) => sum + (org.companies || []).reduce((cSum, comp) => cSum + (comp.invoicesCount || 0), 0),
            0
          );
          const totalUsers = (t.organizations || []).reduce((sum, org) => sum + (org.userCount || 0), 0);

          const companyLabel =
            totalCompanies === 1
              ? lang === "gu"
                ? "કંપની"
                : "Company"
              : lang === "gu"
                ? "કંપનીઓ"
                : "Companies";

          const invoiceLabel = lang === "gu" ? "ઇન્વૉઇસ" : "Invoices";
          const userLabel = lang === "gu" ? "વપરાશકર્તા" : "User(s)";

          return (
            <div>
              <div className="font-bold text-slate-900 text-xs">
                {totalCompanies} {companyLabel}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                {totalInvoices} {invoiceLabel} • {totalUsers} {userLabel}
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        header: lang === "gu" ? "સ્થિતિ" : "STATUS",
        sortable: true,
        accessorFn: (t) => (t.isActive ? "Active" : "Suspended"),
        cell: (t) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleTenantStatus(t);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
              t.isActive
                ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0] hover:bg-[#D1FAE5]"
                : "bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3] hover:bg-[#FFE4E6]"
            }`}
            title="Click to toggle Active / Suspended status"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${t.isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
            <span>{t.isActive ? (lang === "gu" ? "સક્રિય" : "Active") : (lang === "gu" ? "સ્થગિત" : "Suspended")}</span>
          </button>
        ),
      },
      {
        id: "actions",
        header: lang === "gu" ? "ક્રિયાઓ" : "ACTIONS",
        sortable: false,
        headerClassName: "text-left",
        cell: (t) => (
          <TenantActionsMenu
            tenant={t}
            onViewDetails={handleViewTenantDetails}
            onEditTenant={handleOpenEditTenant}
            onManageLicense={(item) => {
              setSelectedTenant(item);
              setEditTier(item.subscriptionTier);
            }}
            onToggleStatus={handleToggleTenantStatus}
            onDeleteTenant={handleOpenSingleDelete}
            onEnterPortal={(cid, cname) => handleImpersonateTenant(cid, cname)}
            lang={lang}
          />
        ),
      },
    ],
    [
      lang,
      getTierInfo,
      handleToggleTenantStatus,
      handleViewTenantDetails,
      handleOpenEditTenant,
      handleImpersonateTenant,
      handleOpenSingleDelete,
    ]
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {lang === "gu" ? "સંસ્થાઓ અને સબ્સ્ક્રિપ્શન મેનેજમેન્ટ" : "Tenants & Organizations"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {lang === "gu"
              ? "ગ્રાહકોની સંસ્થાઓ જુઓ, શોધો, પ્લાન અપગ્રેડ કરો અથવા સીધા એડમિન પોર્ટલમાં પ્રવેશ કરો."
              : "View, search, upgrade plans, extend validity, or jump directly into any customer's tenant."}
          </p>
        </div>
        <button
          onClick={() => setIsCreateTenantOpen(true)}
          className="py-2.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 flex items-center gap-2 cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>{lang === "gu" ? "નવી સંસ્થા બનાવો" : "Create New Tenant"}</span>
        </button>
      </div>

      <DataTable<TenantItem>
        data={tenants}
        columns={tenantColumns}
        keyExtractor={(t) => t.id}
        selectable={true}
        selectedIds={selectedTenantIds}
        onSelectionChange={setSelectedTenantIds}
        renderBulkActions={(selectedIds) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkStatusUpdate(true)}
              disabled={isBulkUpdating}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Activate all selected tenants"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              <span>{lang === "gu" ? "સક્રિય કરો" : "Activate"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkStatusUpdate(false)}
              disabled={isBulkUpdating}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Suspend all selected tenants"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              <span>{lang === "gu" ? "સ્થગિત કરો" : "Suspend"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenBulkDelete}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              title="Permanently delete all selected tenants"
            >
              <span>🗑️</span>
              <span>
                {lang === "gu"
                  ? `કાઢી નાખો (${selectedIds.size})`
                  : `Delete (${selectedIds.size})`}
              </span>
            </button>
          </div>
        )}
        searchPlaceholder={
          lang === "gu"
            ? "ફોન, ઈમેલ, સંસ્થા અથવા આઈડી શોધો..."
            : "Search phone, email, org name, tenant ID..."
        }
        searchKeys={["id", "primaryPhone", "primaryEmail", "subscriptionTier"]}
        customSearchFn={(t, query) => {
          const s = query.toLowerCase();
          return Boolean(
            t.id.toLowerCase().includes(s) ||
              t.primaryPhone.toLowerCase().includes(s) ||
              (t.primaryEmail && t.primaryEmail.toLowerCase().includes(s)) ||
              t.subscriptionTier.toLowerCase().includes(s) ||
              (t.organizations &&
                t.organizations.some(
                  (org) =>
                    org.name.toLowerCase().includes(s) ||
                    (org.legalName && org.legalName.toLowerCase().includes(s)) ||
                    (org.companies &&
                      org.companies.some(
                        (c) =>
                          c.legalName.toLowerCase().includes(s) ||
                          c.tradeName.toLowerCase().includes(s) ||
                          (c.gstin && c.gstin.toLowerCase().includes(s)) ||
                          (c.city && c.city.toLowerCase().includes(s))
                      ))
                ))
          );
        }}
        lang={lang}
        themeColor="purple"
        exportable
        exportFileName="tenants_organizations"
        filtersSlot={
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="">{lang === "gu" ? "તમામ સબ્સ્ક્રિપ્શન પ્લાન" : "All Subscription Tiers"}</option>
              {Object.keys(stats?.subscriptionTiers || TIER_META).map((tierKey) => (
                <option key={tierKey} value={tierKey}>
                  {tierKey}
                </option>
              ))}
            </select>

            <select
              value={tenantStatusFilter}
              onChange={(e) => setTenantStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer shadow-2xs"
            >
              <option value="">{lang === "gu" ? "તમામ સ્થિતિ (Status)" : "All Status"}</option>
              <option value="active">{lang === "gu" ? "સક્રિય (Active)" : "Active"}</option>
              <option value="suspended">{lang === "gu" ? "સ્થગિત (Suspended)" : "Suspended"}</option>
              <option value="expired">{lang === "gu" ? "સમાપ્ત (Expired)" : "Expired"}</option>
            </select>
          </div>
        }
      />

      {/* ===================== MODAL: EDIT TENANT ===================== */}
      <TenantEditModal
        isOpen={Boolean(editingTenant)}
        onClose={handleCloseEditTenant}
        tenant={editingTenant}
        onSave={handleSaveEditTenant}
        isLoading={isEditingTenantSaving}
        lang={lang}
      />

      {/* ===================== MODAL: DELETE TENANT (SINGLE & BULK) ===================== */}
      <TenantDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTenantsToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        tenants={tenantsToDelete}
        isDeleting={isDeletingTenants}
        lang={lang}
      />

      {/* ===================== MODAL: MANAGE SUBSCRIPTION LICENSE ===================== */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setSelectedTenant(null)} aria-hidden="true" />
          <div className="relative z-10 bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 text-slate-800 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🔑</span>
                <span>{lang === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન અને લાયસન્સ" : "Manage Tenant Subscription"}</span>
              </h3>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
                <span className="text-purple-600 font-bold block mb-0.5">Target Organization:</span>
                <span className="font-black text-slate-900 font-mono text-sm block">
                  {selectedTenant.primaryPhone}
                </span>
                <span className="text-[11px] text-slate-500">
                  {selectedTenant.organizations[0]?.name || "Tenant"}
                </span>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1.5">Select Commercial Tier:</label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="TRIAL">Trial (30-day Free Evaluation)</option>
                  <option value="RETAIL_BASIC">Retail Basic (Single Store POS)</option>
                  <option value="WHOLESALE_PRO">Wholesale Pro (Multi-Godown B2B)</option>
                  <option value="DISTRIBUTION_ENTERPRISE">Distribution Enterprise (Multi-Branch)</option>
                  <option value="MANUFACTURING_SUITE">Manufacturing Suite (Production & BoM)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-800 font-bold block mb-1.5">
                  Extend Validity From Current Expiry:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setExtendDays(30)}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                      extendDays === 30
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    +30 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtendDays(90)}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                      extendDays === 90
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    +90 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtendDays(365)}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs cursor-pointer transition-all ${
                      extendDays === 365
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    +1 Year
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedTenant(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingTenant}
                onClick={handleUpdateTenantTier}
                className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingTenant ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: VIEW TENANT DEEP DETAILS ===================== */}
      {viewDetailsTenant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setViewDetailsTenant(null)} aria-hidden="true" />
          <div className="relative z-10 bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 sm:p-7 space-y-5 text-slate-800 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {viewDetailsTenant.organizations?.[0]?.name || "Tenant Profile & Infrastructure"}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  Tenant UUID: {viewDetailsTenant.id}
                </span>
              </div>
              <button
                onClick={() => setViewDetailsTenant(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-xs max-h-[65vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Primary Phone:</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">{viewDetailsTenant.primaryPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Email:</span>
                  <span className="font-bold text-slate-900 font-mono truncate block text-xs">
                    {viewDetailsTenant.primaryEmail || <span className="text-slate-400 font-sans font-normal">—</span>}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Plan Tier:</span>
                  <span className="font-bold text-purple-700 uppercase font-mono text-xs">
                    {viewDetailsTenant.subscriptionTier}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Status:</span>
                  <span className="font-bold text-emerald-700 text-xs">
                    {viewDetailsTenant.isActive ? (lang === "gu" ? "સક્રિય" : "Active") : (lang === "gu" ? "સ્થગિત" : "Suspended")}
                  </span>
                </div>
              </div>

              {/* Companies and Branches */}
              <div>
                <h4 className="font-black text-xs text-slate-900 uppercase mb-3 tracking-wider flex items-center gap-1.5">
                  <span>🏢</span>
                  <span>Registered Companies & Outlets</span>
                </h4>
                <div className="space-y-2.5">
                  {viewDetailsTenant.organizations?.map((org: any) =>
                    org.companies?.map((comp: any) => (
                      <div
                        key={comp.id}
                        className="p-4 bg-white border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs hover:border-purple-300 transition-colors"
                      >
                        <div>
                          <div className="font-black text-sm text-slate-900">{comp.tradeName}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Legal: {comp.legalName} • City: {comp.city || "—"} • GSTIN: <strong className="font-mono">{comp.gstin || "Unregistered"}</strong>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {comp.branches?.length || 0} Branch(es) • {comp.warehouses?.length || 0} Godown(s) • {comp._count?.salesInvoices || 0} Sales Invoices
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setViewDetailsTenant(null);
                            handleImpersonateTenant(comp.id, comp.tradeName);
                          }}
                          className="px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-orange-700 border border-orange-200/80 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <span>🚀</span>
                          <span>Launch Portal</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Users under this organization */}
              <div>
                <h4 className="font-black text-xs text-slate-900 uppercase mb-3 tracking-wider flex items-center gap-1.5">
                  <span>👥</span>
                  <span>Associated Users ({viewDetailsTenant.organizations?.[0]?.users?.length || 0})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {viewDetailsTenant.organizations?.[0]?.users?.map((u: any) => (
                    <div key={u.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {u.phone} • <span className="font-bold text-purple-700">{u.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewDetailsTenant(null)}
                className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuperAdminTenantsPage() {
  return (
    <Suspense fallback={<SuperAdminLoading />}>
      <SuperAdminTenantsContent />
    </Suspense>
  );
}
