// ============================================================================
// Smart Solutions — configuration.
// Until the Supabase placeholders are replaced, the app runs in DEMO MODE:
// demo accounts, demo inventory, everything persisted only in localStorage.
// The structure mirrors the ASC platform (the reference build this app is
// modeled on) so wiring the live backend later is a config change, not a
// rewrite.
// ============================================================================

export const config = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
  APP_BASE_URL: "https://manbeardog13.github.io/Smart-Solutions/",
};

export function isConfigured() {
  return (
    config.SUPABASE_URL.startsWith("http") &&
    !config.SUPABASE_URL.includes("YOUR_") &&
    !config.SUPABASE_ANON_KEY.includes("YOUR_")
  );
}

// The base URL baked into printed QR stickers: the deployment the app is
// actually served from (so stickers always point at the live host), with
// the constant as the fallback for non-http contexts (file://, tests).
export function appBaseUrl() {
  if (typeof location !== "undefined" && /^https?:$/.test(location.protocol)) {
    return location.origin + location.pathname.replace(/[^/]*$/, "");
  }
  return config.APP_BASE_URL;
}
