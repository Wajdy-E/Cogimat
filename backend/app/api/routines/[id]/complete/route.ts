import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await context.params;
		const routineId = parseInt(id);
		const { clerk_id } = await req.json();

		if (!clerk_id) {
			return NextResponse.json({ success: false, error: "clerk_id is required" }, { status: 400 });
		}

		const result = await query(
			`UPDATE routines 
         SET completion_count = completion_count + 1, 
             last_completed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND clerk_id = $2 AND is_active = true 
         RETURNING *`,
			[routineId, clerk_id]
		);

		if (result.length === 0) {
			return NextResponse.json({ success: false, error: "Routine not found or access denied" }, { status: 404 });
		}

		return NextResponse.json({ success: true, routine: result[0] });
	} catch (error) {
		console.error("Error completing routine:", error);
		return NextResponse.json({ success: false, error: "Database update failed" }, { status: 500 });
	}
}
