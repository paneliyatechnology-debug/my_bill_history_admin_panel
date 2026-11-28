"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSuperAdmin } from "../../../context/superadmin-context";
import { DataTable, ColumnDef } from "../../../components/ui/data-table";
import {
  createNewPlan,
  updateExistingPlan,
  deleteExistingPlan,
} from "../../../lib/plans-api";
import type { SubscriptionPlanItem } from "../../../shared-types/superadmin";
import {
  PLATFORM_MODULE_CATALOG,
  MODULE_CATEGORIES,
  MODULE_PRESETS,
  type PlatformModuleDefinition,
} from "../../../lib/superadmin-constants";

export default function SuperAdminPlansPage() {
  const {
    stats,
    plans,
    isLoadingPlans,
    refetchPlans,
    formatInr,
    setActionSuccess,
    setActionError,
  } = useSuperAdmin();

  // View state
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Inspect modules modal state (View details of a plan's modules)
  const [inspectingPlan, setInspectingPlan] = useState<SubscriptionPlanItem | null>(null);

  // Edit / Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Module filter state within the modal
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState<string>("all");
  const [moduleSearchQuery, setModuleSearchQuery] = useState<string>("");

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlanItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    tier: string;
    name: string;
    nameGujarati: string;
    subtitle: string;
    subtitleGujarati: string;
    monthlyPrice: number;
    yearlyPrice: number;
    maxCompanies: number;
    maxInvoicesPerYear: number;
    maxUsers: number;
    maxGodowns: number;
    featuresText: string;
    entitlements: Record<string, boolean>;
    isActive: boolean;
    isPopular: boolean;
    badge: string;
  }>({
    tier: "",
    name: "",
    nameGujarati: "",
    subtitle: "",
    subtitleGujarati: "",
    monthlyPrice: 999,
    yearlyPrice: 799,
    maxCompanies: 1,
    maxInvoicesPerYear: 5000,
    maxUsers: 2,
    maxGodowns: 1,
    featuresText: "Standard B2B & B2C GST Invoicing\nA4 Laser & Thermal Print Themes\nSales & Day-End Cash Book (રોજમેળ)",
    entitlements: { ...MODULE_PRESETS.all },
    isActive: true,
    isPopular: false,
    badge: "",
  });

  const tierCounts: Record<string, number> = stats?.subscriptionTiers || {
    TRIAL: 0,
    RETAIL_BASIC: 1,
    WHOLESALE_PRO: 1,
    DISTRIBUTION_ENTERPRISE: 1,
    MANUFACTURING_SUITE: 1,
  };

  const totalTenants = stats?.tenants?.total || 4;

  // Filtered plans for main listing
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        searchQuery === "" ||
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.tier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (plan.subtitle && plan.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && plan.isActive) ||
        (statusFilter === "inactive" && !plan.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [plans, searchQuery, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setModuleCategoryFilter("all");
    setModuleSearchQuery("");
    setFormData({
      tier: `TIER_${Date.now().toString().slice(-4)}`,
      name: "",
      nameGujarati: "",
      subtitle: "",
      subtitleGujarati: "",
      monthlyPrice: 999,
      yearlyPrice: 799,
      maxCompanies: 1,
      maxInvoicesPerYear: 5000,
      maxUsers: 2,
      maxGodowns: 1,
      featuresText: "Unlimited Sales Invoices\nGST Reports & Compliance\nStandard Thermal Print",
      entitlements: { ...MODULE_PRESETS.all },
      isActive: true,
      isPopular: false,
      badge: "NEW",
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: SubscriptionPlanItem) => {
    setEditingPlan(plan);
    setModuleCategoryFilter("all");
    setModuleSearchQuery("");

    // Build unified entitlements map covering all 35 catalog modules
    const unifiedEntitlements: Record<string, boolean> = {};
    for (const mod of PLATFORM_MODULE_CATALOG) {
      if (plan.entitlements && typeof plan.entitlements[mod.id] === "boolean") {
        unifiedEntitlements[mod.id] = plan.entitlements[mod.id] as boolean;
      } else {
        // Fallback default based on core status or existing general flags
        unifiedEntitlements[mod.id] = mod.isCore || false;
      }
    }

    setFormData({
      tier: plan.tier,
      name: plan.name,
      nameGujarati: plan.nameGujarati || "",
      subtitle: plan.subtitle || "",
      subtitleGujarati: plan.subtitleGujarati || "",
      monthlyPrice: plan.monthlyPrice || 0,
      yearlyPrice: plan.yearlyPrice || 0,
      maxCompanies: plan.maxCompanies !== undefined ? plan.maxCompanies : 1,
      maxInvoicesPerYear: plan.maxInvoicesPerYear !== undefined ? plan.maxInvoicesPerYear : -1,
      maxUsers: plan.maxUsers !== undefined ? plan.maxUsers : 2,
      maxGodowns: plan.maxGodowns !== undefined ? plan.maxGodowns : 1,
      featuresText: Array.isArray(plan.features) ? plan.features.join("\n") : "",
      entitlements: unifiedEntitlements,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      isPopular: Boolean(plan.isPopular),
      badge: plan.badge || "",
    });
    setIsModalOpen(true);
  };

  // Duplicate Plan
  const handleDuplicatePlan = async (plan: SubscriptionPlanItem) => {
    try {
      const duplicatedData = {
        tier: `${plan.tier}_COPY_${Date.now().toString().slice(-4)}`,
        name: `${plan.name} (Copy)`,
        nameGujarati: plan.nameGujarati ? `${plan.nameGujarati} (નકલ)` : "",
        subtitle: plan.subtitle,
        subtitleGujarati: plan.subtitleGujarati,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        maxCompanies: plan.maxCompanies,
        maxInvoicesPerYear: plan.maxInvoicesPerYear,
        maxUsers: plan.maxUsers,
        maxGodowns: plan.maxGodowns,
        features: [...(plan.features || [])],
        featuresGujarati: [...(plan.featuresGujarati || [])],
        entitlements: { ...(plan.entitlements || {}) },
        isActive: false, // Start as draft
        isPopular: false,
        badge: "DRAFT",
      };

      await createNewPlan(duplicatedData);
      setActionSuccess(`Plan "${plan.name}" duplicated as draft.`);
      await refetchPlans();
    } catch (err: any) {
      setActionError(err?.message || "Failed to duplicate plan.");
    }
  };

  // Toggle Active/Inactive
  const handleToggleStatus = async (plan: SubscriptionPlanItem) => {
    try {
      await updateExistingPlan(plan.id, { isActive: !plan.isActive });
      setActionSuccess(`Plan "${plan.name}" status updated to ${!plan.isActive ? "Active" : "Inactive"}.`);
      await refetchPlans();
    } catch (err: any) {
      setActionError(err?.message || "Failed to toggle status");
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (plan: SubscriptionPlanItem) => {
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete / Archive
  const handleConfirmDelete = async () => {
    if (!planToDelete) return;
    try {
      setIsDeleting(true);
      await deleteExistingPlan(planToDelete.id);
      setActionSuccess(`Plan "${planToDelete.name}" deleted / archived.`);
      setIsDeleteModalOpen(false);
      setPlanToDelete(null);
      await refetchPlans();
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle single module entitlement in modal
  const handleToggleModule = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      entitlements: {
        ...prev.entitlements,
        [moduleId]: !prev.entitlements[moduleId],
      },
    }));
  };

  // Apply a preset to form entitlements
  const handleApplyPreset = (presetKey: keyof typeof MODULE_PRESETS) => {
    const preset = MODULE_PRESETS[presetKey];
    setFormData((prev) => ({
      ...prev,
      entitlements: {
        ...prev.entitlements,
        ...preset,
      },
    }));
    setActionSuccess(`Applied ${presetKey.toUpperCase()} module access preset.`);
  };

  // Filter modules inside the modal
  const filteredModalModules = useMemo(() => {
    return PLATFORM_MODULE_CATALOG.filter((mod) => {
      const matchesCategory =
        moduleCategoryFilter === "all" || mod.category === moduleCategoryFilter;
      const q = moduleSearchQuery.trim().toLowerCase();
      const matchesSearch =
        q === "" ||
        mod.name.toLowerCase().includes(q) ||
        mod.nameGujarati.toLowerCase().includes(q) ||
        mod.route.toLowerCase().includes(q) ||
        mod.categoryLabel.toLowerCase().includes(q) ||
        mod.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [moduleCategoryFilter, moduleSearchQuery]);

  // Compute active count inside the modal
  const activeModuleCount = useMemo(() => {
    return PLATFORM_MODULE_CATALOG.filter((m) => Boolean(formData.entitlements[m.id])).length;
  }, [formData.entitlements]);

  // Save Modal Form
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter plan name.");
      return;
    }

    try {
      setIsSaving(true);
      const featuresArray = formData.featuresText
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        tier: formData.tier,
        name: formData.name.trim(),
        nameGujarati: formData.nameGujarati.trim(),
        subtitle: formData.subtitle.trim(),
        subtitleGujarati: formData.subtitleGujarati.trim(),
        monthlyPrice: formData.monthlyPrice,
        yearlyPrice: formData.yearlyPrice,
        maxCompanies: formData.maxCompanies,
        maxInvoicesPerYear: formData.maxInvoicesPerYear,
        maxUsers: formData.maxUsers,
        maxGodowns: formData.maxGodowns,
        features: featuresArray,
        featuresGujarati: featuresArray,
        entitlements: formData.entitlements,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
        badge: formData.badge,
      };

      if (editingPlan) {
        await updateExistingPlan(editingPlan.id, payload);
        setActionSuccess(`Plan "${formData.name}" updated successfully!`);
      } else {
        await createNewPlan(payload);
        setActionSuccess(`New plan "${formData.name}" created successfully!`);
      }

      setIsModalOpen(false);
      setEditingPlan(null);
      await refetchPlans();
    } catch (err: any) {
      setActionError(err?.message || "Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* ================= 1. PAGE HEADER (OFFICIAL MYOWN BILLBOOK DESIGN) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Plans & Pricing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1677E8] border border-blue-200">
              {plans.length} Configured Tiers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Configure multi-tenant SaaS tiers, billing cycles, quotas, and granular module entitlements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Table / Card View Mode Toggle */}
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "table" ? "bg-[#1677E8] text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "grid" ? "bg-[#1677E8] text-white shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card Grid View"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center bg-white border border-[#E5E7EB] rounded-xl p-1 shadow-2xs text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                billingCycle === "monthly" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly View
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "yearly" ? "bg-[#1677E8] text-white font-bold shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Annual Billing</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${billingCycle === "yearly" ? "bg-white/25 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                Save 20%
              </span>
            </button>
          </div>

          {/* Create Plan Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-[#1677E8] hover:bg-[#1268D3] active:bg-[#0D5FC4] text-white rounded-xl px-4 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* ================= 2. PLANS CONTENT (DATATABLE OR GRID) ================= */}
      {viewMode === "table" ? (
        <DataTable<SubscriptionPlanItem>
          data={filteredPlans}
          isLoading={isLoadingPlans}
          keyExtractor={(plan) => plan.id}
          searchPlaceholder="Search plans by name, code..."
          searchKeys={["name", "tier", "subtitle"]}
          themeColor="blue"
          exportable
          exportFileName="subscription_plans"
          emptyMessage="No subscription plans found."
          filtersSlot={
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1677E8] focus:border-[#1677E8] cursor-pointer shadow-2xs"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Archived / Inactive</option>
            </select>
          }
          columns={[
            {
              id: "name",
              header: "Plan Name & Tier",
              accessorKey: "name",
              sortable: true,
              cell: (plan) => (
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{plan.name}</span>
                    {plan.isPopular && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        POPULAR
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tabular-nums text-slate-400 block mt-0.5">
                    {plan.tier}
                  </span>
                </div>
              ),
            },
            {
              id: "price",
              header: "Price / Cycle",
              accessorFn: (plan) => (billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice),
              sortable: true,
              cell: (plan) => {
                const displayPrice = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                return displayPrice > 0 ? (
                  <div>
                    <span className="font-bold tabular-nums text-slate-900 text-sm">
                      ₹{displayPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {billingCycle === "yearly" ? "Billed annually" : "Billed monthly"}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] border border-amber-200">
                    Free Trial (30d)
                  </span>
                );
              },
            },
            {
              id: "fleets",
              header: "Assigned Fleets",
              accessorFn: (plan) => tierCounts[plan.tier] || 0,
              sortable: true,
              cell: (plan) => {
                const assignedCount = tierCounts[plan.tier] || 0;
                const assignedPct = totalTenants > 0 ? Math.round((assignedCount / totalTenants) * 100) : 0;
                return (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 tabular-nums">{assignedCount}</span>
                      <span className="text-[10px] text-slate-400 tabular-nums">({assignedPct}%)</span>
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div style={{ width: `${assignedPct}%` }} className="h-full bg-[#1677E8] rounded-full" />
                    </div>
                  </div>
                );
              },
            },
            {
              id: "limits",
              header: "Quotas & Limits",
              cell: (plan) => (
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div className="font-medium text-slate-900">
                    {plan.maxCompanies === 9999 ? "Unlimited" : plan.maxCompanies} Company • {plan.maxUsers} Users
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    {plan.maxGodowns} Godown • {plan.maxInvoicesPerYear === -1 ? "Unlimited" : plan.maxInvoicesPerYear} Inv/yr
                  </div>
                </div>
              ),
            },
            {
              id: "modules",
              header: "Modules & Access",
              cell: (plan) => {
                const activeMods = PLATFORM_MODULE_CATALOG.filter((m) => Boolean(plan.entitlements?.[m.id])).length;
                const totalMods = PLATFORM_MODULE_CATALOG.length;
                const modPercent = Math.round((activeMods / totalMods) * 100);
                return (
                  <button
                    type="button"
                    onClick={() => setInspectingPlan(plan)}
                    className="group inline-flex flex-col items-start gap-1 p-1 -m-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer text-left"
                    title="Click to view full module breakdown"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#1677E8] border border-blue-200 group-hover:bg-[#1677E8] group-hover:text-white transition-all">
                        {activeMods} of {totalMods} Modules ({modPercent}%)
                      </span>
                      <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#1677E8] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 tabular-nums">
                      {plan.entitlements?.salesInvoices && <span>Sales</span>}
                      {plan.entitlements?.purchaseInvoices && <span>• Purchases</span>}
                      {plan.entitlements?.itemsInventory && <span>• Items</span>}
                      {plan.entitlements?.gstReports && <span>• GST</span>}
                      {plan.entitlements?.manufacturingBom && <span>• BOM</span>}
                    </div>
                  </button>
                );
              },
            },
            {
              id: "isActive",
              header: "Status",
              accessorKey: "isActive",
              sortable: true,
              align: "center",
              cell: (plan) => (
                <button
                  type="button"
                  onClick={() => handleToggleStatus(plan)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                    plan.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  }`}
                >
                  {plan.isActive ? "Active" : "Archived"}
                </button>
              ),
            },
            {
              id: "actions",
              header: "Actions",
              align: "right",
              cell: (plan) => (
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(plan)}
                    className="p-1.5 text-slate-500 hover:text-[#1677E8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit Plan & Modules"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicatePlan(plan)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Duplicate Plan"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(plan)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete / Archive Plan"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ),
            },
          ] as ColumnDef<SubscriptionPlanItem>[]}
        />
      ) : (
        /* Card Grid View with Frontend Filter Ribbon & Card Hover */
        <div className="space-y-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-xs">
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plans by name, code..."
                  className="w-full pl-8 pr-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8] outline-none transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-xl text-slate-900 focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8] outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Archived / Inactive</option>
              </select>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredPlans.length}</span> of {plans.length} plans
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => {
              const assignedCount = tierCounts[plan.tier] || 0;
              const displayPrice = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
              const activeMods = PLATFORM_MODULE_CATALOG.filter((m) => Boolean(plan.entitlements?.[m.id])).length;
              const totalMods = PLATFORM_MODULE_CATALOG.length;

              return (
                <div
                  key={plan.id}
                  className={`bg-white border rounded-2xl p-6 shadow-2xs hover:shadow-md hover:border-[#1677E8]/60 transition-all duration-200 flex flex-col justify-between ${
                    plan.isPopular ? "border-[#1677E8] ring-2 ring-blue-100" : "border-[#E5E7EB]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] tabular-nums font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {plan.tier}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                        {assignedCount} Assigned
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.subtitle}</p>

                    <div className="my-5">
                      {displayPrice > 0 ? (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold tabular-nums text-slate-900">
                            ₹{displayPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">/month</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-[#1677E8]">Free Forever</span>
                      )}
                    </div>

                    <div className="space-y-2 py-4 border-t border-[#E5E7EB] text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Max Companies:</span>
                        <span className="font-bold tabular-nums text-slate-900">{plan.maxCompanies}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Max Staff Users:</span>
                        <span className="font-bold tabular-nums text-slate-900">{plan.maxUsers}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Max Warehouses:</span>
                        <span className="font-bold tabular-nums text-slate-900">{plan.maxGodowns}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Invoices Limit:</span>
                        <span className="font-bold tabular-nums text-slate-900">
                          {plan.maxInvoicesPerYear === -1 ? "Unlimited" : plan.maxInvoicesPerYear}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-500 pt-1">
                        <span>Module Access:</span>
                        <button
                          type="button"
                          onClick={() => setInspectingPlan(plan)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#1677E8] border border-blue-200 hover:bg-[#1677E8] hover:text-white transition-all cursor-pointer"
                        >
                          {activeMods} of {totalMods} Active
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(plan)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer ${
                        plan.isActive ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Archived"}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(plan)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] rounded-xl shadow-xs cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicatePlan(plan)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                        title="Duplicate"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= 4. COMPREHENSIVE CREATE / EDIT MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <form
            onSubmit={handleSavePlan}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col animate-fadeIn overflow-hidden my-auto"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] border-t-4 border-t-[#1677E8] flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-50/40 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1677E8]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingPlan ? `Edit Subscription Plan: ${editingPlan.name}` : "Create New Subscription Plan"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure identity, pricing, quotas, and granular module access.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body with Smooth Scroll */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-50 text-[#1677E8] text-[10px] font-bold flex items-center justify-center">1</span>
                    Basic Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Starter POS & Retail"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Code / Tier *</label>
                    <input
                      type="text"
                      required
                      disabled={Boolean(editingPlan)}
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                      className="w-full px-3 py-2 text-xs tabular-nums uppercase bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8] disabled:bg-slate-100 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description / Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="e.g. Counter POS & Invoicing for Small Retail Shops"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gujarati Subtitle (ગુજરાતી વિગત)</label>
                    <input
                      type="text"
                      value={formData.subtitleGujarati}
                      onChange={(e) => setFormData({ ...formData, subtitleGujarati: e.target.value })}
                      placeholder="e.g. નાની દુકાન અને કાઉન્ટર બિલિંગ માટે"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING & BILLING */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-[#1677E8] text-[10px] font-bold flex items-center justify-center">2</span>
                  Pricing & Currency (INR ₹)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Price (₹/mo)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={formData.monthlyPrice}
                        onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none tabular-nums focus:bg-white focus:border-[#1677E8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Yearly Discounted (₹/mo)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min={0}
                        value={formData.yearlyPrice}
                        onChange={(e) => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none tabular-nums focus:bg-white focus:border-[#1677E8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Billed Total</label>
                    <div className="px-3 py-2 text-xs bg-blue-50/40 border border-blue-200 rounded-xl tabular-nums text-[#1677E8] font-bold flex items-center justify-between">
                      <span>₹{(formData.yearlyPrice * 12).toLocaleString("en-IN")} / yr</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        {formData.monthlyPrice > formData.yearlyPrice
                          ? `Save ${Math.round(((formData.monthlyPrice - formData.yearlyPrice) / formData.monthlyPrice) * 100)}%`
                          : "Regular"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: FLEET RESOURCE QUOTAS */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-[#1677E8] text-[10px] font-bold flex items-center justify-center">3</span>
                  Fleet Resource Quotas
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Companies</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxCompanies}
                      onChange={(e) => setFormData({ ...formData, maxCompanies: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none tabular-nums focus:bg-white focus:border-[#1677E8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Staff Users</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none tabular-nums focus:bg-white focus:border-[#1677E8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Warehouses / Godowns</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxGodowns}
                      onChange={(e) => setFormData({ ...formData, maxGodowns: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none tabular-nums focus:bg-white focus:border-[#1677E8]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Invoices/yr</label>
                    <input
                      type="number"
                      value={formData.maxInvoicesPerYear}
                      onChange={(e) => setFormData({ ...formData, maxInvoicesPerYear: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none tabular-nums focus:bg-white focus:border-[#1677E8]"
                    />
                    <span className="text-[9px] text-slate-400 block mt-0.5">-1 for unlimited</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: FULL DYNAMIC MODULE & MENU ACCESS ENTITLEMENTS */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                {/* Header with Title and Status Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-50 text-[#1677E8] text-[10px] font-bold flex items-center justify-center">4</span>
                      Module & Menu Access Entitlements
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enable or disable individual application menus and features for subscribers of this tier.
                    </p>
                  </div>

                  {/* Active Count Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1677E8] border border-blue-200">
                      {activeModuleCount} of {PLATFORM_MODULE_CATALOG.length} Modules Active ({Math.round((activeModuleCount / PLATFORM_MODULE_CATALOG.length) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1 ml-1">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("all")}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-[#1677E8] hover:text-[#1677E8] font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Select All ({PLATFORM_MODULE_CATALOG.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("retail")}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-[#1677E8] hover:text-[#1677E8] font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Retail Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("wholesale")}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-[#1677E8] hover:text-[#1677E8] font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Wholesale B2B Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("manufacturing")}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-[#1677E8] hover:text-[#1677E8] font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    Manufacturing Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("clear")}
                    className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 font-semibold text-slate-500 transition-colors cursor-pointer"
                  >
                    Clear All (0)
                  </button>
                </div>

                {/* Module Search & Category Filter Tabs */}
                <div className="space-y-2.5">
                  {/* Search Field */}
                  <div className="relative">
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={moduleSearchQuery}
                      onChange={(e) => setModuleSearchQuery(e.target.value)}
                      placeholder="Search modules, routes (e.g. /sales, /gst, BOM, items)..."
                      className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8] transition-colors"
                    />
                    {moduleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setModuleSearchQuery("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    {MODULE_CATEGORIES.map((cat) => {
                      const countInCat =
                        cat.id === "all"
                          ? PLATFORM_MODULE_CATALOG.length
                          : PLATFORM_MODULE_CATALOG.filter((m) => m.category === cat.id).length;
                      const activeInCat =
                        cat.id === "all"
                          ? activeModuleCount
                          : PLATFORM_MODULE_CATALOG.filter(
                              (m) => m.category === cat.id && Boolean(formData.entitlements[m.id])
                            ).length;
                      const isSelected = moduleCategoryFilter === cat.id;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setModuleCategoryFilter(cat.id)}
                          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#1677E8] text-white shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                          }`}
                        >
                          <span>{cat.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : activeInCat > 0
                                ? "bg-blue-50 text-[#1677E8]"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {activeInCat}/{countInCat}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Modules Grid - 2 Column Clean Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredModalModules.map((module) => {
                    const isEnabled = Boolean(formData.entitlements[module.id]);

                    return (
                      <div
                        key={module.id}
                        onClick={() => handleToggleModule(module.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isEnabled
                            ? "bg-blue-50/40 border-blue-300 ring-1 ring-blue-200/60 shadow-2xs"
                            : "bg-white border-slate-200 hover:border-[#1677E8]/50 hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Custom Toggle Switch */}
                        <div className="pt-0.5">
                          <div
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                              isEnabled ? "bg-[#1677E8]" : "bg-slate-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                                isEnabled ? "translate-x-4" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </div>

                        {/* Module Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-xs font-bold truncate ${
                                isEnabled ? "text-[#1677E8]" : "text-slate-800"
                              }`}
                            >
                              {module.name}
                            </span>
                            <span className="text-[9px] tabular-nums font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
                              {module.route}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mb-1 font-medium">
                            {module.nameGujarati}
                          </div>

                          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">
                            {module.description}
                          </p>

                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                              {module.categoryLabel}
                            </span>
                            {module.isCore && (
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                Core Module
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredModalModules.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No modules match &quot;{moduleSearchQuery}&quot; in this category.
                  </div>
                )}
              </div>

              {/* SECTION 5: MARKETING BULLETS */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-[#1677E8] text-[10px] font-bold flex items-center justify-center">5</span>
                  Marketing Feature Bullets (Displayed to Clients)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Enter key display highlights, one bullet point per line.
                </p>
                <textarea
                  rows={3}
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Unlimited Sales Invoices&#10;Counter POS Quick Billing&#10;GST Summary Reports"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#1677E8] transition-colors leading-relaxed"
                />
              </div>

              {/* SECTION 6: STATUS & BADGES */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-[#1677E8] text-[10px] font-bold flex items-center justify-center">6</span>
                  Visibility & Badges
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-[#1677E8] accent-[#1677E8] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Plan Active</span>
                      <span className="text-[10px] text-slate-400">Available for subscriptions</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="rounded text-[#1677E8] accent-[#1677E8] w-4 h-4"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Featured Tier</span>
                      <span className="text-[10px] text-slate-400">Marked as most popular</span>
                    </div>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Badge Tag</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value.toUpperCase() })}
                      placeholder="e.g. POPULAR, BEST VALUE"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none tabular-nums focus:bg-white focus:border-[#1677E8]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70 shrink-0">
              <div className="text-xs text-slate-500 font-medium hidden sm:block">
                All changes sync automatically to the subscription engine.
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] active:bg-[#0D5FC4] rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && (
                    <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  )}
                  <span>{isSaving ? "Saving Configuration..." : "Save Plan Configuration"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ================= 5. INSPECT MODULE DETAILS MODAL ================= */}
      {inspectingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col animate-fadeIn overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#E5E7EB] border-t-4 border-t-[#1677E8] flex items-center justify-between bg-gradient-to-r from-blue-50/40 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1677E8]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {inspectingPlan.name} • Entitlement Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tier: <span className="tabular-nums font-bold text-slate-700">{inspectingPlan.tier}</span> • Complete module catalog status.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingPlan(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50/40 rounded-2xl border border-blue-200">
                <span className="text-xs font-semibold text-[#1677E8]">Active Modules Summary:</span>
                <span className="text-xs font-bold text-[#1677E8]">
                  {PLATFORM_MODULE_CATALOG.filter((m) => Boolean(inspectingPlan.entitlements?.[m.id])).length} of {PLATFORM_MODULE_CATALOG.length} Modules Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PLATFORM_MODULE_CATALOG.map((mod) => {
                  const isEnabled = Boolean(inspectingPlan.entitlements?.[mod.id]);

                  return (
                    <div
                      key={mod.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                        isEnabled
                          ? "bg-emerald-50/30 border-emerald-200 text-slate-800"
                          : "bg-slate-50 border-slate-200/80 text-slate-400 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isEnabled ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                        <div className="truncate">
                          <span className={`font-semibold block truncate ${isEnabled ? "text-slate-900" : "text-slate-500"}`}>
                            {mod.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block tabular-nums">{mod.route}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          isEnabled
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {isEnabled ? "Enabled" : "Locked"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setInspectingPlan(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = inspectingPlan;
                  setInspectingPlan(null);
                  handleOpenEdit(p);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#1677E8] hover:bg-[#1268D3] rounded-xl cursor-pointer shadow-xs"
              >
                Edit Entitlements
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 6. DELETE / ARCHIVE CONFIRMATION MODAL ================= */}
      {isDeleteModalOpen && planToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Archive / Delete Plan</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-800">{planToDelete.name}</span>?
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              <span className="font-bold text-slate-800">Assigned Fleets:</span> {tierCounts[planToDelete.tier] || 0} organizations currently subscribed. If organizations are active, the plan will be safely archived without disrupting current billing contracts.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Archiving..." : "Confirm Archive / Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
