import { createClient } from "@supabase/supabase-js";

// Use Replit's built-in PostgreSQL database
// Credentials are in DATABASE_URL environment variable
const DATABASE_URL = process.env.DATABASE_URL || "";

// Parse PostgreSQL connection string to Supabase format
function createSupabaseClient() {
  if (!DATABASE_URL) {
    console.warn("[Supabase] DATABASE_URL not set - using localStorage only");
    return null;
  }

  try {
    // For Replit's PostgreSQL, we create a direct postgres client connection
    // This is a simple wrapper that handles saves
    return {
      async saveState(userId: string, state: any) {
        try {
          const res = await fetch("/api/db/save-state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, state })
          });
          
          if (!res.ok) {
            console.warn("[Supabase] Save failed:", res.status);
            return false;
          }
          return true;
        } catch (err) {
          console.warn("[Supabase] Save error:", err);
          return false;
        }
      },

      async loadState(userId: string) {
        try {
          const res = await fetch(`/api/db/load-state?userId=${encodeURIComponent(userId)}`);
          
          if (!res.ok) {
            console.warn("[Supabase] Load failed:", res.status);
            return null;
          }
          
          const data = await res.json();
          return data.state || null;
        } catch (err) {
          console.warn("[Supabase] Load error:", err);
          return null;
        }
      }
    };
  } catch (err) {
    console.warn("[Supabase] Init error:", err);
    return null;
  }
}

export const supabase = createSupabaseClient();
