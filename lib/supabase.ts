import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  return token || null;
}

export function createSupabaseClientWithToken(token: string) {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

export async function getAuthenticatedUserId(client: any): Promise<string | null> {
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user?.id) {
    return null;
  }

  return data.user.id;
}

export async function saveStateToSupabase(client: any, userId: string, state: any) {
  if (!client) return false;

  try {
    if (!state || !state.weeks) {
      console.error("[SUPABASE] Refusing to save invalid state object");
      return false;
    }

    const { error } = await client
      .from("planner_state")
      .upsert(
        {
          user_id: userId,
          state: state,
          program_name: state.programName || "Return to Form",
          theme: state.theme || "dark-knight",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

    if (error) {
      console.error("[SUPABASE] Upsert Error:", error.message, error.details);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[SUPABASE] Fatal Save Exception:", err);
    return false;
  }
}

export async function loadStateFromSupabase(client: any, userId: string) {
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
