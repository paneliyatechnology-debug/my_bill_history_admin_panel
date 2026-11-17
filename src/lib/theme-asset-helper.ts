/**
 * Theme Asset URL Resolver
 * Resolves theme thumbnails and background artwork URLs dynamically
 * across both local development (localhost:3001, localhost:3000, localhost:4000)
 * and production (superadmin.myownbillbook.com, myownbillbook.com, api.myownbillbook.com).
 */

export function getBackendOrigin(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || "";
  if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
    return envUrl.replace(/\/api\/v1\/?$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:4000";
    }
    if (host.includes("myownbillbook.com")) {
      return "https://api.myownbillbook.com";
    }
  }
  return "";
}

export function resolveThemeAssetUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed) return "";

  // 1. Base64 Data URLs and Blob URLs are self-contained
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const backendOrigin = getBackendOrigin();

  // 2. Handle absolute URLs (e.g. http://localhost:4000/... vs https://api.myownbillbook.com/...)
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If running in production but URL has localhost:4000, rewrite to production backend
    if (backendOrigin && !backendOrigin.includes("localhost") && trimmed.includes("localhost:4000")) {
      return trimmed.replace("http://localhost:4000", backendOrigin);
    }
    // If running locally but URL has production api, rewrite to local backend
    if (backendOrigin && backendOrigin.includes("localhost") && trimmed.includes("api.myownbillbook.com")) {
      return trimmed.replace("https://api.myownbillbook.com", backendOrigin);
    }
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return trimmed;
  }

  // Ensure path starts with /
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  // 3. Built-in preset themes bundled statically in Next.js public/themes
  const isBuiltInPreset =
    path.startsWith("/themes/navaratri_") ||
    path.startsWith("/themes/diwali_") ||
    path.startsWith("/themes/durga_puja_") ||
    path.startsWith("/themes/dussehra_") ||
    path.startsWith("/themes/dhanteras_");

  // Dynamically uploaded themes (e.g. /themes/invoice_christmas_...) reside on the backend server
  if (!isBuiltInPreset && backendOrigin) {
    return `${backendOrigin}${path}`;
  }

  return path;
}

