"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import { apiClient } from "../../../lib/api-client";
import { useSuperAdmin } from "../../../context/superadmin-context";

interface GlobalHsnItem {
  id: string;
  code: string;
  type: "HSN" | "SAC";
  description: string;
  descriptionGujarati?: string | null;
  gstRate: number;
  cessRate?: number | null;
  chapter?: string | null;
  notes?: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
}

interface ParsedImportRow {
  code: string;
  type: "HSN" | "SAC";
  description: string;
  descriptionGujarati?: string;
  gstRate: number;
  cessRate: number;
  chapter?: string;
  valid: boolean;
  error?: string;
}

const VALID_GST_SLABS = [0, 0.1, 0.25, 3, 5, 12, 18, 28];

export default function SuperAdminHsnPage() {
  const { setActionSuccess, setActionError } = useSuperAdmin();

  const [items, setItems] = useState<GlobalHsnItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ total: 0, hsn: 0, sac: 0, active: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "HSN" | "SAC">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Multi-select & bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GlobalHsnItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "HSN" as "HSN" | "SAC",
    description: "",
    descriptionGujarati: "",
    chapter: "",
    gstRate: 18,
    cessRate: 0,
    notes: "",
  });

  // Excel Import modal
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ParsedImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  const fetchHsnCodes = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, any> = { page, limit };
      if (search.trim()) params.search = search.trim();
      if (typeFilter !== "ALL") params.type = typeFilter;
      if (statusFilter === "ACTIVE") params.isActive = "true";
      if (statusFilter === "INACTIVE") params.isActive = "false";

      const res: any = await apiClient.get("/super-admin/hsn", params);
      setItems(Array.isArray(res?.items) ? res.items : []);
      setTotal(Number(res?.total || 0));
      setTotalPages(Math.max(1, Number(res?.totalPages || 1)));
      if (res?.counts) setCounts(res.counts);
      setSelectedIds(new Set());
    } catch (err: any) {
      setActionError(err?.message || "Failed to load global HSN/SAC codes.");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, typeFilter, statusFilter, setActionError]);

  useEffect(() => {
    fetchHsnCodes();
  }, [fetchHsnCodes]);

  const allOnPageSelected = useMemo(
    () => items.length > 0 && items.every((it) => selectedIds.has(it.id)),
    [items, selectedIds],
  );

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((it) => it.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      code: "",
      type: "HSN",
      description: "",
      descriptionGujarati: "",
      chapter: "",
      gstRate: 18,
      cessRate: 0,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: GlobalHsnItem) => {
    setEditingItem(item);
    setFormData({
      code: item.code,
      type: item.type,
      description: item.description,
      descriptionGujarati: item.descriptionGujarati || "",
      chapter: item.chapter || "",
      gstRate: Number(item.gstRate ?? 18),
      cessRate: Number(item.cessRate ?? 0),
      notes: item.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.description.trim()) {
      setActionError("HSN/SAC code and description are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        code: formData.code.trim(),
        type: formData.type,
        description: formData.description.trim(),
        descriptionGujarati: formData.descriptionGujarati.trim() || undefined,
        chapter: formData.chapter.trim() || undefined,
        gstRate: Number(formData.gstRate),
        cessRate: Number(formData.cessRate) || 0,
        notes: formData.notes.trim() || undefined,
      };

      if (editingItem) {
        await apiClient.patch(`/super-admin/hsn/${editingItem.id}`, payload);
        setActionSuccess(`Global ${payload.type} code '${payload.code}' updated.`);
      } else {
        await apiClient.post("/super-admin/hsn", payload);
        setActionSuccess(`Global ${payload.type} code '${payload.code}' added for all organizations.`);
      }
      setIsModalOpen(false);
      fetchHsnCodes();
    } catch (err: any) {
      setActionError(err?.message || "Failed to save HSN/SAC code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: GlobalHsnItem) => {
    try {
      await apiClient.patch(`/super-admin/hsn/${item.id}`, {
        isActive: !item.isActive,
      });
      setActionSuccess(
        `HSN/SAC '${item.code}' ${!item.isActive ? "activated" : "deactivated"}.`,
      );
      fetchHsnCodes();
    } catch (err: any) {
      setActionError(err?.message || "Failed to update status.");
    }
  };

  const handleDelete = async (item: GlobalHsnItem) => {
    if (!confirm(`Delete global HSN/SAC '${item.code}'?`)) return;
    try {
      await apiClient.delete(`/super-admin/hsn/${item.id}`);
      setActionSuccess(`Global HSN/SAC '${item.code}' deleted.`);
      fetchHsnCodes();
    } catch (err: any) {
      setActionError(err?.message || "Failed to delete HSN/SAC code.");
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected global HSN/SAC code(s)?`)) return;
    try {
      setIsBulkDeleting(true);
      const res: any = await apiClient.post("/super-admin/hsn/bulk-delete", { ids });
      const deletedCount = Number(res?.deletedCount || 0);
      const skippedCount = Number(res?.skippedCount || 0);
      setActionSuccess(
        `Deleted ${deletedCount} code(s)${skippedCount > 0 ? ` (${skippedCount} skipped because linked to items)` : ""}.`,
      );
      setSelectedIds(new Set());
      fetchHsnCodes();
    } catch (err: any) {
      setActionError(err?.message || "Failed to bulk delete HSN/SAC codes.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Excel template download
  const handleDownloadSampleExcel = () => {
    const sampleData = [
      {
        Code: "1006",
        Type: "HSN",
        Description: "Rice",
        "Description Gujarati": "ચોખા",
        "GST Rate": 5,
        "Cess Rate": 0,
        Chapter: "10",
      },
      {
        Code: "998314",
        Type: "SAC",
        Description: "IT design and development services",
        "Description Gujarati": "આઈટી ડિઝાઇન અને ડેવલપમેન્ટ સેવાઓ",
        "GST Rate": 18,
        "Cess Rate": 0,
        Chapter: "99",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "HSN_SAC_Template");
    XLSX.writeFile(wb, "global_hsn_sac_template.xlsx");
  };

  // Parse uploaded Excel/CSV (supports banner rows & official CBIC/GST HSN sheets)
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    setImportProgress("");

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const firstSheet = wb.SheetNames[0];
      if (!firstSheet) {
        setActionError("No sheet found in the uploaded file.");
        return;
      }

      const matrix: any[][] = XLSX.utils.sheet_to_json(wb.Sheets[firstSheet], {
        header: 1,
        defval: "",
      });

      const normHeader = (val: any) =>
        String(val ?? "")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

      const CODE_KEYS = new Set([
        "code",
        "hsncode",
        "hsn",
        "hsncd",
        "sac",
        "saccode",
        "hsnsac",
        "hsnsaccode",
        "tariff",
        "tariffitem",
        "itemcode",
        "hsnno",
      ]);
      const DESC_KEYS = new Set([
        "description",
        "hsndesc",
        "desc",
        "descriptionofgoods",
        "goodsdescription",
        "descriptionofservices",
        "particulars",
        "name",
        "itemdescription",
      ]);
      const GUJ_KEYS = new Set([
        "descriptiongujarati",
        "gujaratidescription",
        "gujarati",
      ]);
      const TYPE_KEYS = new Set(["type", "hsntype"]);
      const GST_KEYS = new Set([
        "gstrate",
        "gst",
        "igst",
        "igstrate",
        "taxrate",
        "gstpercent",
        "tax",
        "rate",
      ]);
      const CGST_KEYS = new Set(["cgst", "cgstrate"]);
      const SGST_KEYS = new Set(["sgst", "sgstrate", "utgst"]);
      const CESS_KEYS = new Set(["cessrate", "cess"]);
      const CHAPTER_KEYS = new Set(["chapter", "chap"]);

      // Find header row within first 25 rows
      let headerRowIdx = -1;
      let codeCol = -1;
      let descCol = -1;
      let gujCol = -1;
      let typeCol = -1;
      let gstCol = -1;
      let cgstCol = -1;
      let sgstCol = -1;
      let cessCol = -1;
      let chapterCol = -1;

      for (let r = 0; r < Math.min(25, matrix.length); r++) {
        const row = matrix[r] || [];
        let foundCode = -1;
        let foundDesc = -1;
        for (let c = 0; c < row.length; c++) {
          const h = normHeader(row[c]);
          if (!h) continue;
          if (foundCode === -1 && (CODE_KEYS.has(h) || h.includes("hsncd") || h.includes("hsncode"))) {
            foundCode = c;
          }
          if (foundDesc === -1 && (DESC_KEYS.has(h) || h.includes("description") || h.includes("hsndesc"))) {
            foundDesc = c;
          }
        }
        if (foundCode !== -1 && foundDesc !== -1) {
          headerRowIdx = r;
          codeCol = foundCode;
          descCol = foundDesc;
          for (let c = 0; c < row.length; c++) {
            const h = normHeader(row[c]);
            if (gujCol === -1 && GUJ_KEYS.has(h)) gujCol = c;
            if (typeCol === -1 && TYPE_KEYS.has(h)) typeCol = c;
            if (gstCol === -1 && GST_KEYS.has(h)) gstCol = c;
            if (cgstCol === -1 && CGST_KEYS.has(h)) cgstCol = c;
            if (sgstCol === -1 && SGST_KEYS.has(h)) sgstCol = c;
            if (cessCol === -1 && CESS_KEYS.has(h)) cessCol = c;
            if (chapterCol === -1 && CHAPTER_KEYS.has(h)) chapterCol = c;
          }
          break;
        }
      }

      // Fallback: auto-detect columns by data pattern if no header row matched
      if (headerRowIdx === -1) {
        const sampleRows = matrix.slice(0, 30);
        const maxCols = sampleRows.reduce((m, r) => Math.max(m, r.length), 0);
        for (let c = 0; c < maxCols; c++) {
          const codeHits = sampleRows.filter((r) => /^[0-9]{2,8}$/.test(String(r[c] ?? "").trim())).length;
          if (codeCol === -1 && codeHits >= 3) codeCol = c;
        }
        if (codeCol !== -1) {
          for (let c = 0; c < maxCols; c++) {
            if (c === codeCol) continue;
            const textHits = sampleRows.filter((r) => String(r[c] ?? "").trim().length > 4).length;
            if (textHits >= 3) {
              descCol = c;
              break;
            }
          }
        }
      }

      if (codeCol === -1 || descCol === -1) {
        setActionError("Could not detect Code and Description columns in this Excel/CSV file.");
        return;
      }

      const dataRows = matrix.slice(headerRowIdx >= 0 ? headerRowIdx + 1 : 0);
      const parsed: ParsedImportRow[] = [];

      for (const row of dataRows) {
        const rawCodeCell = String(row[codeCol] ?? "").trim();
        const rawDescCell = String(row[descCol] ?? "").trim();
        if (!rawCodeCell && !rawDescCell) continue;

        const cleanCode = rawCodeCell.replace(/[^0-9]/g, "").trim();
        const rawType = typeCol >= 0 ? String(row[typeCol] ?? "").trim().toUpperCase() : "";
        const type: "HSN" | "SAC" =
          rawType === "SAC" || rawType === "HSN"
            ? (rawType as "HSN" | "SAC")
            : cleanCode.startsWith("99")
              ? "SAC"
              : "HSN";

        let gstRate = 18;
        if (gstCol >= 0 && String(row[gstCol] ?? "").trim() !== "") {
          const parsedGst = Number(String(row[gstCol]).replace(/%/g, "").trim());
          if (!isNaN(parsedGst) && VALID_GST_SLABS.includes(parsedGst)) {
            gstRate = parsedGst;
          }
        } else if (cgstCol >= 0 || sgstCol >= 0) {
          const cVal = Number(String(row[cgstCol] ?? 0).replace(/%/g, "").trim()) || 0;
          const sVal = Number(String(row[sgstCol] ?? 0).replace(/%/g, "").trim()) || 0;
          const combined = Number((cVal + sVal).toFixed(2));
          if (VALID_GST_SLABS.includes(combined)) {
            gstRate = combined;
          }
        }

        const cessRate =
          cessCol >= 0
            ? Math.max(0, Number(String(row[cessCol] ?? 0).replace(/%/g, "").trim()) || 0)
            : 0;
        const chapter =
          chapterCol >= 0 && String(row[chapterCol] ?? "").trim()
            ? String(row[chapterCol]).trim()
            : cleanCode.slice(0, 2);
        const descriptionGujarati =
          gujCol >= 0 && String(row[gujCol] ?? "").trim()
            ? String(row[gujCol]).trim()
            : undefined;

        let valid = true;
        let error = "";
        if (!/^[0-9]{2,8}$/.test(cleanCode)) {
          valid = false;
          error = "Code must be 2–8 digits";
        } else if (!rawDescCell) {
          valid = false;
          error = "Description required";
        }

        parsed.push({
          code: cleanCode,
          type,
          description: rawDescCell,
          descriptionGujarati,
          gstRate,
          cessRate,
          chapter,
          valid,
          error,
        });
      }

      setImportRows(parsed);
    } catch (err: any) {
      setActionError(err?.message || "Failed to parse Excel/CSV file.");
    }
  };

  const handleConfirmImport = async () => {
    const validRows = importRows.filter((r) => r.valid);
    if (validRows.length === 0) {
      setActionError("No valid rows to import.");
      return;
    }

    try {
      setIsImporting(true);
      const CHUNK_SIZE = 500;
      const totalBatches = Math.ceil(validRows.length / CHUNK_SIZE);
      let totalCreated = 0;
      let totalUpdated = 0;
      let totalSkipped = 0;

      for (let b = 0; b < totalBatches; b++) {
        const chunk = validRows.slice(b * CHUNK_SIZE, (b + 1) * CHUNK_SIZE);
        setImportProgress(`Importing batch ${b + 1} of ${totalBatches}...`);
        const res: any = await apiClient.post("/super-admin/hsn/bulk-import", {
          items: chunk,
        });
        totalCreated += Number(res?.createdCount || 0);
        totalUpdated += Number(res?.updatedCount || 0);
        totalSkipped += Number(res?.skippedCount || 0);
      }

      setActionSuccess(
        `Imported HSN/SAC: ${totalCreated} created, ${totalUpdated} updated${totalSkipped ? `, ${totalSkipped} skipped` : ""}.`,
      );
      setIsImportOpen(false);
      setImportRows([]);
      setImportFileName("");
      setImportProgress("");
      setPage(1);
      fetchHsnCodes();
    } catch (err: any) {
      setActionError(err?.message || "Failed to import HSN/SAC codes.");
    } finally {
      setIsImporting(false);
      setImportProgress("");
    }
  };

  // Pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const startEntry = total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry = Math.min(total, page * limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Global Default HSN / SAC Master</h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Codes added here are available by default to all organizations. Organizations can also add their own custom codes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setImportRows([]);
              setImportFileName("");
              setIsImportOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-blue-50/40 hover:border-[#1677E8]/60 text-slate-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            Import Excel / CSV
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#1677E8] hover:bg-[#1268D3] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            + Add Global HSN / SAC
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#1677E8]/60 p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total Default Codes</div>
          <div className="text-2xl font-bold tabular-nums text-slate-900 mt-1">{counts.total}</div>
        </div>
        <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/40 hover:border-[#1677E8] p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">HSN Codes</div>
          <div className="text-2xl font-bold tabular-nums text-[#1677E8] mt-1">{counts.hsn}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-purple-300 p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">SAC Codes</div>
          <div className="text-2xl font-bold tabular-nums text-purple-600 mt-1">{counts.sac}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-emerald-300 p-4 shadow-2xs hover:shadow-md transition-all duration-200">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Active</div>
          <div className="text-2xl font-bold tabular-nums text-[#16834A] mt-1">{counts.active}</div>
        </div>
      </div>

      {/* Filters & Bulk Action Bar */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search code, description, chapter..."
          className="flex-1 px-3 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1677E8] focus:ring-1 focus:ring-[#1677E8]"
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setPage(1);
            setTypeFilter(e.target.value as any);
          }}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="ALL">All Types</option>
          <option value="HSN">HSN Only</option>
          <option value="SAC">SAC Only</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value as any);
          }}
          className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="font-semibold text-rose-800">
            {selectedIds.size} HSN/SAC code(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-white text-slate-700 font-medium cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold disabled:opacity-50 cursor-pointer"
            >
              {isBulkDeleting ? "Deleting..." : `Delete Selected (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAFBFD] border-b border-[#E2E8F0] text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all on page"
                    className="rounded border-slate-300 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">GST %</th>
                <th className="py-3 px-4 text-right">Cess %</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Loading global HSN/SAC codes...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No global HSN/SAC codes found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 ${selectedIds.has(item.id) ? "bg-indigo-50/40" : ""}`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelectOne(item.id)}
                        aria-label={`Select ${item.code}`}
                        className="rounded border-slate-300 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4 tabular-nums font-semibold text-slate-900">{item.code}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === "SAC"
                            ? "bg-purple-50 text-purple-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      <div className="font-medium text-slate-900">{item.description}</div>
                      {item.descriptionGujarati && (
                        <div className="text-[11px] text-slate-500">{item.descriptionGujarati}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">
                      {Number(item.gstRate)}%
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                      {Number(item.cessRate || 0)}%
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-indigo-600 hover:underline font-medium cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-rose-600 hover:underline font-medium cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Proper Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50/40">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800">{startEntry}</strong>–
              <strong className="text-slate-800">{endEntry}</strong> of{" "}
              <strong className="text-slate-800">{total}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 border border-slate-200 rounded-lg bg-white text-xs"
              >
                {[10, 25, 50, 100].map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            {pageNumbers.map((num, idx) =>
              num === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-slate-400">
                  ...
                </span>
              ) : (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium cursor-pointer ${
                    page === num
                      ? "bg-[#1677E8] border-[#1677E8] text-white shadow-xs font-bold"
                      : "bg-white border-[#E5E7EB] text-slate-900 hover:bg-[#F3F4F6]"
                  }`}
                >
                  {num}
                </button>
              ),
            )}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingItem ? `Edit Global ${editingItem.type} (${editingItem.code})` : "Add Global HSN / SAC"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => {
                      const code = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
                      setFormData({
                        ...formData,
                        code,
                        type: code.startsWith("99") ? "SAC" : "HSN",
                      });
                    }}
                    placeholder="e.g. 1006 or 998311"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="HSN">HSN (Goods)</option>
                    <option value="SAC">SAC (Services)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product or service description"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gujarati Description</label>
                <input
                  type="text"
                  value={formData.descriptionGujarati}
                  onChange={(e) => setFormData({ ...formData, descriptionGujarati: e.target.value })}
                  placeholder="વર્ણન (વૈકલ્પિક)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {VALID_GST_SLABS.map((r) => (
                      <option key={r} value={r}>
                        {r}%
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cess (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cessRate}
                    onChange={(e) => setFormData({ ...formData, cessRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chapter</label>
                  <input
                    type="text"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="Auto"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-[#1677E8] hover:bg-[#1268D3] text-white font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Update Code" : "Create Code"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel / CSV Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Import Global HSN / SAC via Excel / CSV</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Existing global codes with the same code will be updated; new ones will be created for all organizations.
                </p>
              </div>
              <button
                onClick={() => setIsImportOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <div className="font-semibold text-slate-800">Upload .xlsx, .xls, or .csv</div>
                <div className="text-slate-500">
                  Columns: Code, Type (HSN/SAC), Description, Description Gujarati, GST Rate, Cess Rate, Chapter
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-700 font-semibold hover:bg-indigo-50 cursor-pointer whitespace-nowrap"
              >
                Download Sample Excel
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center text-xs">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFileChange}
                className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1677E8] file:text-white hover:file:bg-[#1268D3] cursor-pointer"
              />
              {importFileName && (
                <p className="mt-2 text-slate-600">
                  Selected: <strong>{importFileName}</strong> ({importRows.length} row(s) parsed —{" "}
                  <span className="text-emerald-700 font-semibold">
                    {importRows.filter((r) => r.valid).length} valid
                  </span>
                  {importRows.some((r) => !r.valid) && (
                    <span className="text-rose-600 font-semibold ml-1">
                      , {importRows.filter((r) => !r.valid).length} invalid
                    </span>
                  )}
                  )
                </p>
              )}
            </div>

            {importRows.length > 0 && (
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Code</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3 text-right">GST %</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importRows.slice(0, 100).map((r, idx) => (
                      <tr key={idx} className={r.valid ? "" : "bg-rose-50/50"}>
                        <td className="py-2 px-3 tabular-nums font-semibold">{r.code || "—"}</td>
                        <td className="py-2 px-3">{r.type}</td>
                        <td className="py-2 px-3 truncate max-w-[200px]">{r.description || "—"}</td>
                        <td className="py-2 px-3 text-right">{r.gstRate}%</td>
                        <td className="py-2 px-3">
                          {r.valid ? (
                            <span className="text-emerald-700 font-semibold">Valid</span>
                          ) : (
                            <span className="text-rose-600 font-semibold">{r.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isImporting || importRows.filter((r) => r.valid).length === 0}
                onClick={handleConfirmImport}
                className="px-4 py-2 rounded-xl bg-[#1677E8] hover:bg-[#1268D3] text-white font-semibold shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isImporting
                  ? (importProgress || "Importing...")
                  : `Import ${importRows.filter((r) => r.valid).length} Valid Code(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
