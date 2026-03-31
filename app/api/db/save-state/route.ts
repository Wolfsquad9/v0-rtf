import { NextResponse } from "next/server";
import {
  createSupabaseClientWithToken,
  extractBearerToken,
  getAuthenticatedUserId,
  loadStateFromSupabase,
  saveStateToSupabase,
} from "@/lib/supabase";

export async function POST(req: Request) {
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

    const { state } = await req.json();
    if (!state) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const requestTime = new Date().toISOString();

    const existingState = await loadStateFromSupabase(client, userId);

    if (existingState) {
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
        console.log(`[FORENSIC-DB] Mutation Applied: ${oldNextDay.training[0]?.loadKg !== newNextDay.training[0]?.loadKg}`);
      }
    }

    const stateToSave = { ...state, lastSavedAt: requestTime };
    const success = await saveStateToSupabase(client, userId, stateToSave);

    if (!success) {
      return NextResponse.json({ error: "Save failed" }, { status: 500 });
    }

    const verifiedState = await loadStateFromSupabase(client, userId);
    const verifiedTime = verifiedState?.lastSavedAt;

    if (verifiedTime !== requestTime) {
      console.error(`[FORENSIC-DB] Stale read! Expected ${requestTime}, got ${verifiedTime}`);
    }

    return NextResponse.json({ success: true, updatedAt: requestTime });
  } catch (err) {
    console.error("[FORENSIC-DB] FATAL ERROR:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
