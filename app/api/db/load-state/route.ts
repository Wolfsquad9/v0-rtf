import { NextResponse } from "next/server";
import { loadStateFromSupabase, getAuthenticatedUserId } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = await loadStateFromSupabase(userId);

    return NextResponse.json({
      state: state
    });
  } catch (err) {
    console.error("[API] Load error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
