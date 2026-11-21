import type { DetailedInvoiceData } from "../components/invoice/invoice-details-modal";

export interface SystemStats {
  tenants: {
    total: number;
    active: number;
    suspended: number;
    trial: number;
    expired: number;
  };
  subscriptionTiers: Record<string, number>;
  infrastructure: {
    organizations: number;
    companies: number;
    branches: number;
    warehouses: number;
  };
  users: {
    total: number;
    active: number;
    byRole: Record<string, number>;
  };
  businessVolume: {
    totalInvoices: number;
    grossVolume: number;
    totalTaxableAmount: number;
    totalGstAmount: number;
  };
  subscribers?: {
    total: number;
    active: number;
    trial: number;
    expired: number;
  };
  revenue?: {
    mrr: number;
    arr: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    subscriptionRevenue: number;
    oneTimeRevenue: number;
    refunds: number;
    netRevenue: number;
  };
  subscriptionAnalytics?: {
    active: number;
    trial: number;
    expired: number;
    cancelled: number;
    pastDue: number;
    pending: number;
  };
  paymentAnalytics?: {
    successful: number;
    pending: number;
    failed: number;
    refunded: number;
    totalAmount: number;
    successRate: number;
  };
  recentActivity?: any[];
  systemHealth: {
    databaseStatus: string;
    rlsStatus: string;
    totalAuditEvents: number;
    uptimeSeconds: number;
    nodeVersion: string;
    timestamp: string;
  };
}

export interface TenantItem {
  id: string;
  primaryPhone: string;
  primaryEmail: string | null;
  subscriptionTier: string;
  subscriptionEnds: string;
  isActive: boolean;
  createdAt: string;
  organizations: Array<{
    id: string;
    name: string;
    legalName: string;
    userCount: number;
    users?: Array<{
      id: string;
      fullName: string;
      phone: string;
      email?: string | null;
      role: string;
      isActive: boolean;
    }>;
    companies: Array<{
      id: string;
      legalName: string;
      tradeName: string;
      gstin: string | null;
      city: string;
      stateCode: string;
      branchesCount: number;
      invoicesCount: number;
      branches?: Array<{ id: string; name: string }>;
      warehouses?: Array<{ id: string; name: string }>;
      _count?: {
        salesInvoices?: number;
      };
    }>;
  }>;
}

export interface UserItem {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: string;
  preferredLang: string;
  isActive: boolean;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    tenantId?: string;
  } | null;
}

export interface AuditLogItem {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress: string | null;
  recordHash: string;
  createdAt: string;
  user?: {
    id?: string;
    fullName?: string;
    phone?: string;
    role?: string;
  } | null;
  company?: {
    id?: string;
    tradeName?: string;
    legalName?: string;
  } | null;
}

export type InvoiceItem = DetailedInvoiceData;

export interface DiagnosticsData {
  database: {
    status: string;
    latencyMs: number;
    engine: string;
    rlsEnforced: boolean;
  };
  system: {
    uptimeSeconds: number;
    nodeVersion: string;
    memoryHeapUsedMb: number;
    memoryRssMb: number;
    environment: string;
    timestamp: string;
  };
}

export interface SubscriptionPlanItem {
  id: string;
  tier: string;
  name: string;
  nameGujarati: string;
  subtitle: string;
  subtitleGujarati: string;
  monthlyPrice: number;
  yearlyPrice: number;
  annualTotal: number;
  discountPercent?: number;
  monthlyPaise?: number;
  yearlyPaise?: number;
  maxCompanies: number;
  maxInvoicesPerYear: number;
  maxUsers: number;
  maxGodowns: number;
  features: string[];
  featuresGujarati: string[];
  entitlements?: {
    posBilling?: boolean;
    gstReports?: boolean;
    barcodeThermal?: boolean;
    doubleEntryLedgers?: boolean;
    eInvoiceEwaybill?: boolean;
    stockTransfers?: boolean;
    manufacturingBom?: boolean;
    whatsAppReminders?: boolean;
    customThemes?: boolean;
    prioritySupport?: boolean;
    [key: string]: boolean | undefined;
  };
  isActive: boolean;
  isPopular?: boolean;
  badge?: string | null;
  badgeColor?: string;
  accentColor?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type NavSectionId =
  | "overview"
  | "tenants"
  | "plans"
  | "invoices"
  | "users"
  | "audit"
  | "health"
  | "themes";

