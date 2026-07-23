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
