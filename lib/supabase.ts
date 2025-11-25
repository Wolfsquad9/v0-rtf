import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "";

let supabaseClient: any = null;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("[Supabase] Missing credentials - falling back to localStorage only");
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  return supabaseClient;
}

export async function saveStateToSupabase(userId: string, state: any) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from("planner_state")
      .upsert({
        user_id: userId,
        state: state,
        program_name: state.programName || null,
        theme: state.theme || "dark-knight",
        updated_at: new Date().toISOString()
      } as any);

    if (error) {
      console.error("[Supabase] Save error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Supabase] Save exception:", err);
    return false;
  }
}

export async function loadStateFromSupabase(userId: string) {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("planner_state")
      .select("state")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found - this is OK
        return null;
      }
      console.error("[Supabase] Load error:", error);
      return null;
    }

    return (data as any)?.state || null;
  } catch (err) {
    console.error("[Supabase] Load exception:", err);
    return null;
  }
}

export async function initializeSupabaseTable() {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    // Check if table exists by trying to query it
    const { data, error } = await client
      .from("planner_state")
      .select("id")
      .limit(1);

    if (error && error.code === "PGRST116") {
      console.log("[Supabase] Table exists but is empty");
      return;
    }

    if (error && error.code?.includes("42P01")) {
      console.log("[Supabase] Table does not exist, creating...");
      // Table will be created via dashboard or migrations
      return;
    }

    console.log("[Supabase] Table is ready");
  } catch (err) {
    console.error("[Supabase] Init error:", err);
  }
}
