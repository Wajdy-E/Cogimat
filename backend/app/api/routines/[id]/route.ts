import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const routineId = parseInt(params.id);
		const { clerk_id, name, description, exercises, is_active } = await req.json();

		if (!clerk_id || !name || !exercises || !Array.isArray(exercises)) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Validate exercises array
		if (exercises.length === 0) {
			return NextResponse.json({ success: false, error: "At least one exercise is required" }, { status: 400 });
		}

		// Validate each exercise object
		for (const exercise of exercises) {
			if (!exercise.exercise_id || !exercise.exercise_type || exercise.order === undefined) {
				return NextResponse.json({ success: false, error: "Invalid exercise format" }, { status: 400 });
			}
		}

		const result = await query(
			`UPDATE routines 
			 SET name = $1, description = $2, exercises = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
			 WHERE id = $5 AND clerk_id = $6 
			 RETURNING *`,
			[name, description || null, JSON.stringify(exercises), is_active !== false, routineId, clerk_id]
		);

		if (result.length === 0) {
			return NextResponse.json({ success: false, error: "Routine not found or access denied" }, { status: 404 });
		}

		return NextResponse.json({ success: true, routine: result[0] });
	} catch (error) {
		console.error("Error updating routine:", error);
		return NextResponse.json({ success: false, error: "Database update failed" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	try {
		const routineId = parseInt(params.id);
		const { searchParams } = new URL(req.url);
		const clerk_id = searchParams.get("clerk_id");

		if (!clerk_id) {
			return NextResponse.json({ success: false, error: "clerk_id is required" }, { status: 400 });
		}

		const result = await query("UPDATE routines SET is_active = false WHERE id = $1 AND clerk_id = $2 RETURNING id", [
			routineId,
			clerk_id,
		]);

		if (result.length === 0) {
			return NextResponse.json({ success: false, error: "Routine not found or access denied" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting routine:", error);
		return NextResponse.json({ success: false, error: "Database delete failed" }, { status: 500 });
	}
}
