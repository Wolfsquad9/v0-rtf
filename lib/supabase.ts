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

export async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  const authClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data, error } = await authClient.auth.getUser();
  if (error || !data?.user?.id) {
    return null;
  }

  return data.user.id;
}

export async function saveStateToSupabase(userId: string, state: any) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // CRITICAL: Ensure we are not saving an undefined or broken state
    if (!state || !state.weeks) {
      console.error("[SUPABASE] Refusing to save invalid state object");
      return false;
    }

    console.log(`[SUPABASE] Executing UPSERT for user ${userId}...`);

    const { data, error } = await client
      .from("planner_state")
      .upsert(
        {
          user_id: userId,
          state: state,
          program_name: state.programName || "Return to Form",
          theme: state.theme || "dark-knight",
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id" }
      )
      .select();

    if (error) {
      console.error("[SUPABASE] Upsert Error:", error.message, error.details);
      return false;
    }

    console.log(`[SUPABASE] Persistence Verified for ${userId}. Rows affected: ${data?.length}`);
    return true;
  } catch (err) {
    console.error("[SUPABASE] Fatal Save Exception:", err);
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
      .maybeSingle();

    if (error) {
      console.error("[SUPABASE] Load Error:", error.message);
      return null;
    }

    return data?.state || null;
  } catch (err) {
    console.error("[SUPABASE] Fatal Load Exception:", err);
    return null;
  }
}

export async function initializeSupabaseTable() {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    const { error } = await client
      .from("planner_state")
      .select("id")
      .limit(1);

    if (error) {
      console.log("[SUPABASE] Table status check:", error.message);
    } else {
      console.log("[SUPABASE] Table operational");
    }
  } catch (err) {
    console.error("[SUPABASE] Init error:", err);
  }
}
