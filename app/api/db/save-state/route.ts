import { NextResponse } from "next/server";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getPool() {
  if (!DATABASE_URL) {
    return null;
  }
  return new Pool({ connectionString: DATABASE_URL });
}

export async function POST(req: Request) {
  try {
    const { userId, state } = await req.json();

    if (!userId || !state) {
      return NextResponse.json(
        { error: "Missing userId or state" },
        { status: 400 }
      );
    }

    const pool = await getPool();
    if (!pool) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const query = `
      INSERT INTO planner_state (user_id, state, program_name, theme, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        state = $2,
        program_name = $3,
        theme = $4,
        updated_at = NOW()
      RETURNING id, updated_at;
    `;

    const result = await pool.query(query, [
      userId,
      JSON.stringify(state),
      state.programName || null,
      state.theme || "dark-knight"
    ]);

    await pool.end();

    return NextResponse.json({
      success: true,
      id: result.rows[0]?.id,
      updatedAt: result.rows[0]?.updated_at
    });
  } catch (err) {
    console.error("[DB] Save error:", err);
    return NextResponse.json(
      { error: "Failed to save state" },
      { status: 500 }
    );
  }
}
