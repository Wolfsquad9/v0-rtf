import { NextResponse } from "next/server";
import { saveStateToSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, state } = await req.json();

    if (!userId || !state) {
      return NextResponse.json(
        { error: "Missing userId or state" },
        { status: 400 }
      );
    }

    console.log(`[DB-SAVE] Persistence Request: User ${userId}`);
    console.log(`[DB-SAVE] Cursor: Week ${state.programCursor?.weekIndex}, Day ${state.programCursor?.dayIndex}`);

    const success = await saveStateToSupabase(userId, state);

    if (!success) {
      console.error(`[DB-SAVE] Failed to persist state for user ${userId}`);
      return NextResponse.json(
        { error: "Failed to save state" },
        { status: 500 }
      );
    }

    console.log(`[DB-SAVE] Result: Success. Stored state version: ${state.lastSavedAt || 'unknown'}`);

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[DB-SAVE] Critical Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
