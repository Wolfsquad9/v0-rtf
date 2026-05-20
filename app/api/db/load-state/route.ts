import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  extractBearerToken,
  getAuthenticatedUserId,
  loadStateFromSupabase,
} from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = createSupabaseClientWithToken(token);
    if (!client) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const userId = await getAuthenticatedUserId(client);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = await loadStateFromSupabase(client, userId);

    return NextResponse.json({ state });
  } catch (err) {
    console.error("[API] Load error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
