import { NextResponse } from "next/server";
import { saveStateToSupabase, loadStateFromSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId, state } = await req.json();

    if (!userId || !state) {
      return NextResponse.json(
        { error: "Missing userId or state" },
        { status: 400 }
      );
    }

    // FORENSIC LOGGING: START
    console.log(`[FORENSIC-DB] UPDATE Chain Started for User: ${userId}`);
    
    // FETCH CURRENT STATE (PRE-UPDATE)
    const prevState = await loadStateFromSupabase(userId);
    if (prevState) {
      console.log(`[FORENSIC-DB] Pre-Update Cursor: W${prevState.programCursor?.weekIndex} D${prevState.programCursor?.dayIndex}`);
    }

    // PERSIST MUTATED STATE
    const success = await saveStateToSupabase(userId, state);

    if (!success) {
      console.error(`[FORENSIC-DB] UPDATE FAILED for user ${userId}`);
      return NextResponse.json(
        { error: "Failed to save state" },
        { status: 500 }
      );
    }

    // VERIFY MUTATION (RE-FETCH)
    const verifiedState = await loadStateFromSupabase(userId);
    if (verifiedState) {
       console.log(`[FORENSIC-DB] Mutation Verified. New Version Timestamp: ${verifiedState.lastSavedAt}`);
       console.log(`[FORENSIC-DB] New Cursor: W${verifiedState.programCursor?.weekIndex} D${verifiedState.programCursor?.dayIndex}`);
    }

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[FORENSIC-DB] Critical Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
