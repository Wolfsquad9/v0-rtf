import { NextResponse } from "next/server";
import { loadStateFromSupabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
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
