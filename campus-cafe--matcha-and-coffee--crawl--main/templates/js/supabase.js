window.getCampusCafeSupabase = function() {
    const config = window.CAMPUS_CAFE_SUPABASE_CONFIG;

    if (!config || !config.url || !config.anonKey ||
        config.url.startsWith("YOUR_") || config.anonKey.startsWith("YOUR_")) {
        throw new Error("Supabase is not configured. Add your project URL and anon key in js/supabase-config.js.");
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        throw new Error("Supabase could not load. Check your internet connection and reload the page.");
    }

    if (!window.campusCafeSupabaseClient) {
        window.campusCafeSupabaseClient = window.supabase.createClient(config.url, config.anonKey);
    }

    return window.campusCafeSupabaseClient;
};
