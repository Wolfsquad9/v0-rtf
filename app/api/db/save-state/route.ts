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

    const success = await saveStateToSupabase(userId, state);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to save state" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("[API] Save error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
