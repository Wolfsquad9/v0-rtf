import { NextResponse } from "next/server";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL || "";

async function getPool() {
  if (!DATABASE_URL) {
    return null;
  }
  return new Pool({ connectionString: DATABASE_URL });
}

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

    const pool = await getPool();
    if (!pool) {
      return NextResponse.json(
        { state: null }
      );
    }

    const result = await pool.query(
      "SELECT state FROM planner_state WHERE user_id = $1",
      [userId]
    );

    await pool.end();

    if (result.rows.length === 0) {
      return NextResponse.json({ state: null });
    }

    return NextResponse.json({
      state: result.rows[0].state
    });
  } catch (err) {
    console.error("[DB] Load error:", err);
    return NextResponse.json({ state: null });
  }
}
