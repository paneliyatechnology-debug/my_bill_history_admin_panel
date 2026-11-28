"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "../../lib/api-client";
import { resolveThemeAssetUrl, getBackendOrigin } from "../../lib/theme-asset-helper";

export interface InvoiceThemeItem {
  id: string;
  name: string;
  category: "festive" | "standard" | "branding";
  festivalName?: string;
  description?: string;
  primaryColor: string;
  badge?: string | null;
  thumbnail: string;
  variants: string[];
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface InvoiceThemesManagementProps {
  lang?: "en" | "gu";
}

export function InvoiceThemesManagement({ lang = "en" }: InvoiceThemesManagementProps) {
  const [themes, setThemes] = useState<InvoiceThemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "festive" | "standard">("all");
  const [banner, setBanner] = useState<string | null>(null);

  // Upload state tracking
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const variant1FileRef = useRef<HTMLInputElement>(null);
  const variant2FileRef = useRef<HTMLInputElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<InvoiceThemeItem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    category: "festive" | "standard" | "branding";
    festivalName: string;
    description: string;
    primaryColor: string;
    badge: string;
    thumbnail: string;
    variant1: string;
    variant2: string;
    isActive: boolean;
    sortOrder: number;
  }>({
    name: "",
    category: "festive",
    festivalName: "",
    description: "",
    primaryColor: "#F97316",
    badge: "FESTIVE",
    thumbnail: "/themes/navaratri_1.jpg",
    variant1: "/themes/navaratri_1.jpg",
    variant2: "",
    isActive: true,
    sortOrder: 1,
  });

  // Client-side Image Compressor to Data URL
  const compressImageToDataUrl = (
    source: File | string,
    maxDim = 1200,
    quality = 0.82
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(typeof source === "string" ? source : "");
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => {
        resolve(typeof source === "string" ? source : "");
      };
      if (typeof source === "string") {
        img.src = source;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = (e.target?.result as string) || "";
        };
        reader.onerror = () => resolve("");
        reader.readAsDataURL(source);
      }
    });
  };

  const handleFileUpload = async (file: File, field: "variant1" | "variant2" | "thumbnail") => {
    setUploadingField(field);
    try {
      const compressedDataUrl = await compressImageToDataUrl(
        file,
        field === "thumbnail" ? 400 : 1200,
        field === "thumbnail" ? 0.75 : 0.82
      );

      let publicUrl = "";
      try {
        const formDataPayload = new FormData();
        formDataPayload.append("file", file);
        const uploadRes = await fetch("/api/upload-theme", {
          method: "POST",
          body: formDataPayload,
        });
        if (uploadRes.ok) {
          const json = await uploadRes.json();
          if (json?.url) publicUrl = json.url;
        }
      } catch {
        // Fallback
      }

      const finalUrl = publicUrl || compressedDataUrl;

      setFormData((prev) => {
        const updated = { ...prev, [field]: finalUrl };
        if (field === "variant1" && !prev.thumbnail) {
          updated.thumbnail = finalUrl;
        }
        return updated;
      });
    } catch (err: any) {
      alert("Failed to process image: " + err?.message);
    } finally {
      setUploadingField(null);
    }
  };

  const onFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "variant1" | "variant2" | "thumbnail"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, field);
    }
    e.target.value = "";
  };

  const fetchThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await apiClient.get("/invoice-settings/superadmin/themes");
      if (Array.isArray(res)) {
        setThemes(res);
      } else if (res?.managedThemes && Array.isArray(res.managedThemes)) {
        setThemes(res.managedThemes);
      } else {
        setThemes([]);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load invoice themes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThemes();
  }, [fetchThemes]);

  const handleOpenAdd = () => {
    setEditingTheme(null);
    setFormData({
      name: "",
      category: "festive",
      festivalName: "",
      description: "",
      primaryColor: "#F97316",
      badge: "FESTIVE",
      thumbnail: "/themes/navaratri_1.jpg",
      variant1: "/themes/navaratri_1.jpg",
      variant2: "",
      isActive: true,
      sortOrder: themes.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (theme: InvoiceThemeItem) => {
    setEditingTheme(theme);
    setFormData({
      name: theme.name,
      category: theme.category,
      festivalName: theme.festivalName || "",
      description: theme.description || "",
      primaryColor: theme.primaryColor || "#F97316",
      badge: theme.badge || "",
      thumbnail: theme.thumbnail || "",
      variant1: theme.variants[0] || "",
      variant2: theme.variants[1] || "",
      isActive: theme.isActive,
      sortOrder: theme.sortOrder || 1,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (theme: InvoiceThemeItem) => {
    try {
      const nextActive = !theme.isActive;
      await apiClient.put(`/invoice-settings/superadmin/themes/${theme.id}`, {
        isActive: nextActive,
      });
      setThemes((prev) =>
        prev.map((t) => (t.id === theme.id ? { ...t, isActive: nextActive } : t))
      );
      setBanner(`Theme "${theme.name}" ${nextActive ? "activated" : "deactivated"}.`);
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to toggle status: " + err?.message);
    }
  };

  const handleDelete = async (theme: InvoiceThemeItem) => {
    if (!confirm(`Are you sure you want to delete theme "${theme.name}"?`)) return;
    try {
      await apiClient.delete(`/invoice-settings/superadmin/themes/${theme.id}`);
      setThemes((prev) => prev.filter((t) => t.id !== theme.id));
      setBanner(`Theme "${theme.name}" deleted.`);
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to delete theme: " + err?.message);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Restore default festive themes (Navaratri, Durga Puja, Dussehra, Dhanteras, Diwali)?")) return;
    try {
      setLoading(true);
      const res: any = await apiClient.post("/invoice-settings/superadmin/themes/reset");
      if (Array.isArray(res)) {
        setThemes(res);
      } else {
        await fetchThemes();
      }
      setBanner("Default themes successfully restored!");
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to reset themes: " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Please enter a theme name");
      return;
    }

    const normalizeUrl = (u: string) => {
      const t = (u || "").trim();
      if (!t) return "";
      if (t.startsWith("/") || t.startsWith("http://") || t.startsWith("https://") || t.startsWith("data:")) return t;
      return `/${t}`;
    };

    setLoading(true);
    try {
      const v1 = normalizeUrl(formData.variant1);
      const v2 = normalizeUrl(formData.variant2);

      const variants: string[] = [];
      if (v1) variants.push(v1);
      if (v2) variants.push(v2);

      const isFestive = formData.category === "festive" || formData.category === "branding";
      const defaultThumb = isFestive ? "/themes/navaratri_1.jpg" : "";
      const rawThumb = formData.thumbnail || variants[0] || defaultThumb;
      const thumbnail = normalizeUrl(rawThumb);

      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        festivalName: formData.festivalName.trim() || formData.name.trim(),
        description: formData.description.trim(),
        primaryColor: formData.primaryColor,
        badge: formData.badge.trim() || null,
        thumbnail,
        variants: variants.length > 0 ? variants : (isFestive ? ["/themes/navaratri_1.jpg"] : []),
        isActive: formData.isActive,
        sortOrder: Number(formData.sortOrder) || 1,
      };

      if (editingTheme) {
        const updated: any = await apiClient.put(
          `/invoice-settings/superadmin/themes/${editingTheme.id}`,
          payload
        );
        setThemes((prev) =>
          prev.map((t) => (t.id === editingTheme.id ? { ...t, ...updated } : t))
        );
        setBanner(`Theme "${payload.name}" updated successfully!`);
      } else {
        const created: any = await apiClient.post("/invoice-settings/superadmin/themes", payload);
        setThemes((prev) => [...prev, created]);
        setBanner(`Theme "${payload.name}" created successfully!`);
      }
      setIsModalOpen(false);
      setTimeout(() => setBanner(null), 3000);
    } catch (err: any) {
      alert("Failed to save theme: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const filteredThemes = themes.filter((t) => {
    if (activeTab === "festive") return t.category === "festive" || t.category === "branding";
    if (activeTab === "standard") return t.category === "standard";
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner Notice */}
      {banner && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{banner}</span>
          </div>
          <button onClick={() => setBanner(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#1677E8] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4 5 5 0 015-5c.966 0 1.867.324 2.593.874.34.257.77.376 1.196.326.685-.08 1.25-.563 1.436-1.228A6.993 6.993 0 0114 7c3.866 0 7 3.134 7 7 0 2.21-1.007 4.186-2.585 5.5" />
              </svg>
            </span>
            <span>{lang === "gu" ? "ઇન્વૉઇસ થીમ સ્ટોર મેનેજમેન્ટ" : "Invoice Themes & Festive Store"}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal max-w-xl">
            {lang === "gu"
              ? "તહેવારોની સ્પેશિયલ બેકગ્રાઉન્ડ ઇમેજીસ, રંગો અને થીમ્સ સુપર એડમિનથી લાઇવ મેનેજ કરો. અહીંથી કરેલા ફેરફારો બધા યુઝર્સના ઇન્વૉઇસ સેટિંગ્સમાં તરત જ દેખાશે."
              : "Manage seasonal festival backgrounds, letterhead stationery artwork, and GST invoice themes in real-time. Changes configured here instantly appear in all tenants' invoice live preview studios."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="py-2 px-3 bg-white hover:bg-blue-50/40 text-slate-900 border border-[#E5E7EB] hover:border-[#1677E8]/60 rounded-xl text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Restore default festive themes (Navaratri, Durga Puja, Dussehra, Dhanteras, Diwali)"
          >
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{lang === "gu" ? "ડિફોલ્ટ પુનઃસ્થાપિત કરો" : "Reset Defaults"}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="py-2 px-3.5 bg-[#1677E8] hover:bg-[#1268D3] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-sm">+</span>
            <span>{lang === "gu" ? "નવી થીમ ઉમેરો" : "Add New Theme"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "All Themes", count: themes.length },
            { id: "festive", label: "Festive & Seasonal", count: themes.filter((t) => t.category === "festive" || t.category === "branding").length },
            { id: "standard", label: "Standard GST Themes", count: themes.filter((t) => t.category === "standard").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#1677E8] text-white shadow-xs"
                  : "bg-[#F8FAFC] text-slate-500 hover:bg-blue-50 hover:text-[#1677E8]"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] tabular-nums ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={fetchThemes}
          className="text-xs font-bold text-slate-500 hover:text-[#1677E8] flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <span>↻ Refresh</span>
        </button>
      </div>

      {/* Themes Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400 font-bold animate-pulse">
          Loading invoice themes catalogue...
        </div>
      ) : error ? (
        <div className="py-12 text-center text-xs text-rose-600 bg-rose-50 rounded-2xl border border-rose-200 font-bold">
          {error}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="py-20 text-center text-xs text-slate-400 font-medium bg-white rounded-2xl border border-slate-200/80">
          No themes found under this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredThemes.map((theme) => {
            const hasMultipleVariants = theme.variants.length > 1;
            return (
              <div
                key={theme.id}
                className={`group relative flex flex-col rounded-2xl border bg-white p-4 shadow-2xs transition-all duration-200 hover:shadow-md ${
                  theme.isActive ? "border-[#E5E7EB] hover:border-[#1677E8]/60" : "border-slate-200 bg-slate-50/60 opacity-60"
                }`}
              >
                {/* Badge on top right */}
                {theme.badge && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-[#1677E8] px-2.5 py-0.5 text-[9px] font-semibold uppercase text-white shadow-xs">
                    {theme.badge}
                  </span>
                )}

                {/* Preview Thumbnail Box */}
                <div className="relative h-48 w-full overflow-hidden rounded-2xl border border-slate-100 bg-[#FAF8F5] shadow-2xs flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider p-2 text-center select-none">
                    {theme.name || "Theme"}
                  </div>
                  {theme.thumbnail ? (
                    <img
                      src={resolveThemeAssetUrl(theme.thumbnail)}
                      alt={theme.name}
                      className="relative z-1 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const currentSrc = target.getAttribute("src") || "";
                        const backendOrigin = getBackendOrigin();
                        if (backendOrigin && currentSrc.startsWith(backendOrigin)) {
                          const localPath = currentSrc.slice(backendOrigin.length);
                          target.onerror = () => {
                            target.onerror = null;
                            target.style.display = "none";
                          };
                          target.src = localPath;
                          return;
                        }
                        if (backendOrigin && !currentSrc.startsWith("http") && !currentSrc.startsWith("data:")) {
                          const backendPath = `${backendOrigin}${currentSrc.startsWith("/") ? currentSrc : `/${currentSrc}`}`;
                          target.onerror = () => {
                            target.onerror = null;
                            target.style.display = "none";
                          };
                          target.src = backendPath;
                          return;
                        }
                        target.onerror = null;
                        target.style.display = "none";
                      }}
                      onLoad={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "block";
                      }}
                    />
                  ) : null}

                  {/* Primary Color Indicator */}
                  <div
                    className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-white/95 px-2 py-0.5 shadow-2xs backdrop-blur-xs text-[10px] tabular-nums font-bold text-slate-800"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <span>{theme.primaryColor}</span>
                  </div>

                  {hasMultipleVariants && (
                    <div className="absolute bottom-2 right-2 rounded-lg bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[9px] tabular-nums font-bold text-white shadow-2xs">
                      {theme.variants.length} Variants
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="mt-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900 group-hover:text-[#1677E8] transition-colors truncate">
                        {theme.name}
                      </h3>
                      <span className="text-[10px] font-medium text-slate-400">
                        {theme.category}
                      </span>
                    </div>

                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-500 leading-tight font-normal">
                      {theme.description || "Invoice stationery background template"}
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(theme)}
                      className={`text-[10.5px] font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        theme.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {theme.isActive ? "● Active" : "○ Inactive"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(theme)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(theme)}
                        className="rounded-lg border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 shadow-2xs cursor-pointer flex items-center justify-center"
                        title="Delete theme"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Theme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingTheme ? "Edit Invoice Theme" : "Add New Invoice Theme"}
                </h3>
                <p className="text-xs text-slate-500">
                  Upload or configure background artwork images for the live invoice studio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Theme Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Holi Special, Diwali 2026"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Festival / Tag Name</label>
                  <input
                    type="text"
                    value={formData.festivalName}
                    onChange={(e) => setFormData({ ...formData, festivalName: e.target.value })}
                    placeholder="e.g. Navaratri, Diwali"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold bg-slate-50 focus:bg-white focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none cursor-pointer"
                  >
                    <option value="festive">Festive / Seasonal</option>
                    <option value="standard">Standard GST</option>
                    <option value="branding">Custom Branding</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Badge</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. NEW, FESTIVE"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="h-8 w-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-2 py-1.5 tabular-nums text-xs focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Variant 1 Background Image URL *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formData.variant1}
                    onChange={(e) => setFormData({ ...formData, variant1: e.target.value, thumbnail: formData.thumbnail || e.target.value })}
                    placeholder="/themes/navaratri_1.jpg or https://..."
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                  <input
                    ref={variant1FileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onFileInputChange(e, "variant1")}
                  />
                  <button
                    type="button"
                    onClick={() => variant1FileRef.current?.click()}
                    disabled={uploadingField === "variant1"}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#1677E8] bg-blue-50 hover:bg-blue-100 px-3.5 py-2.5 text-xs font-bold text-[#1677E8] transition-all disabled:opacity-50 cursor-pointer"
                    title="Upload image file (JPG, PNG, WebP — max 5MB)"
                  >
                    {uploadingField === "variant1" ? "Uploading…" : "Upload"}
                  </button>
                </div>
                {/* Image Preview */}
                {formData.variant1 && (
                  <div className="mt-2.5">
                    <img
                      src={resolveThemeAssetUrl(formData.variant1)}
                      alt="Variant 1 preview"
                      className="h-20 w-auto max-w-full rounded-xl border border-slate-200 object-cover shadow-xs"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Variant 2 Background Image URL (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.variant2}
                    onChange={(e) => setFormData({ ...formData, variant2: e.target.value })}
                    placeholder="/themes/navaratri_2.jpg or https://..."
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                  <input
                    ref={variant2FileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onFileInputChange(e, "variant2")}
                  />
                  <button
                    type="button"
                    onClick={() => variant2FileRef.current?.click()}
                    disabled={uploadingField === "variant2"}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#1677E8] bg-blue-50 hover:bg-blue-100 px-3.5 py-2.5 text-xs font-bold text-[#1677E8] transition-all disabled:opacity-50 cursor-pointer"
                    title="Upload image file"
                  >
                    {uploadingField === "variant2" ? "Uploading…" : "Upload"}
                  </button>
                </div>
                {/* Image Preview */}
                {formData.variant2 && (
                  <div className="mt-2.5">
                    <img
                      src={resolveThemeAssetUrl(formData.variant2)}
                      alt="Variant 2 preview"
                      className="h-20 w-auto max-w-full rounded-xl border border-slate-200 object-cover shadow-xs"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Thumbnail Preview Image URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                    placeholder="Defaults to Variant 1 if left empty"
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                  <input
                    ref={thumbnailFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => onFileInputChange(e, "thumbnail")}
                  />
                  <button
                    type="button"
                    onClick={() => thumbnailFileRef.current?.click()}
                    disabled={uploadingField === "thumbnail"}
                    className="shrink-0 flex items-center gap-1.5 rounded-xl border border-[#1677E8] bg-blue-50 hover:bg-blue-100 px-3.5 py-2.5 text-xs font-bold text-[#1677E8] transition-all disabled:opacity-50 cursor-pointer"
                    title="Upload image file"
                  >
                    {uploadingField === "thumbnail" ? "Uploading…" : "Upload"}
                  </button>
                </div>
                {/* Thumbnail Preview */}
                {formData.thumbnail && (
                  <div className="mt-2.5">
                    <img
                      src={resolveThemeAssetUrl(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="h-20 w-auto max-w-full rounded-xl border border-slate-200 object-cover shadow-xs"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      onLoad={(e) => { (e.target as HTMLImageElement).style.display = "block"; }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of this theme..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-[#1677E8] focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded text-[#1677E8] accent-[#1677E8] focus:ring-[#1677E8]"
                  />
                  <span>Active & Visible to all business tenants</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1677E8] hover:bg-[#1268D3] px-6 py-2.5 font-bold text-white shadow-xs cursor-pointer"
                >
                  {editingTheme ? "Update Theme" : "Create Theme"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
