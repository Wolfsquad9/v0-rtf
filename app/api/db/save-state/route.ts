import { NextResponse } from "next/server";
import { saveStateToSupabase, loadStateFromSupabase, getAuthenticatedUserId } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { state } = await req.json();

    if (!state) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const requestTime = new Date().toISOString();
    console.log(`\n[FORENSIC-DB] === TRANSACTION START: ${requestTime} ===`);
    console.log(`[FORENSIC-DB] User: ${userId}`);

    // 1. COMPARISON: Check the next session's load in the current DB vs the incoming payload
    const existingState = await loadStateFromSupabase(userId);

    if (existingState) {
      // Find the first non-completed day to verify mutation
      const findFirstPlanned = (s: any) => {
        for (const w of s.weeks) {
          for (const d of w.days) {
            if (d.status === "PLANNED") return d;
          }
        }
        return null;
      };

      const oldNextDay = findFirstPlanned(existingState);
      const newNextDay = findFirstPlanned(state);

      if (oldNextDay && newNextDay) {
        console.log(`[FORENSIC-DB] Change Detection (First Planned Day):
          - OLD Load: ${oldNextDay.training[0]?.loadKg}kg
          - NEW Load: ${newNextDay.training[0]?.loadKg}kg
          - Mutation Applied: ${oldNextDay.training[0]?.loadKg !== newNextDay.training[0]?.loadKg}`);
      }
    }

    // 2. PERSIST
    const stateToSave = { ...state, lastSavedAt: requestTime };
    const success = await saveStateToSupabase(userId, stateToSave);

    if (!success) {
      console.error(`[FORENSIC-DB] PERSISTENCE FAILED`);
      return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }

    // 3. VERIFY: Read back immediately to ensure the DB actually holds the new value
    const verifiedState = await loadStateFromSupabase(userId);
    const verifiedTime = verifiedState?.lastSavedAt;

    if (verifiedTime === requestTime) {
      console.log(`[FORENSIC-DB] VERIFICATION SUCCESS: DB matches mutation at ${verifiedTime}`);
    } else {
      console.error(`[FORENSIC-DB] VERIFICATION FAILURE: Stale read! Expected ${requestTime}, got ${verifiedTime}`);
    }

    console.log(`[FORENSIC-DB] === TRANSACTION END ===\n`);

    return NextResponse.json({ success: true, updatedAt: requestTime });
  } catch (err) {
    console.error("[FORENSIC-DB] FATAL ERROR:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
