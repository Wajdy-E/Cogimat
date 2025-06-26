import { WeeklyWorkoutGoal } from "@/type";
import { query } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const clerk_id = searchParams.get("clerk_id");

		if (!clerk_id) {
			return NextResponse.json({ success: false, error: "Missing clerk_id" }, { status: 400 });
		}

		const result = await query("SELECT * FROM weekly_workout_goals WHERE clerk_id = $1 AND is_active = true", [
			clerk_id,
		]);

		if (result.length === 0) {
			return NextResponse.json({ success: true, weeklyGoal: null });
		}

		return NextResponse.json({ success: true, weeklyGoal: result[0] });
	} catch (error) {
		console.error("GET weekly goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const { clerk_id, selected_days, reminder_time } = await req.json();

		if (!clerk_id || !selected_days || !reminder_time) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Validate selected_days is an array
		if (!Array.isArray(selected_days)) {
			return NextResponse.json({ success: false, error: "selected_days must be an array" }, { status: 400 });
		}

		// Validate reminder_time format (HH:MM:SS)
		const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
		if (!timeRegex.test(reminder_time)) {
			return NextResponse.json(
				{ success: false, error: "Invalid reminder_time format. Use HH:MM:SS" },
				{ status: 400 }
			);
		}

		// Check if user already has a weekly goal
		const existingGoal = await query("SELECT id FROM weekly_workout_goals WHERE clerk_id = $1", [clerk_id]);

		let result;
		if (existingGoal.length === 0) {
			// Create new weekly goal
			result = await query(
				`INSERT INTO weekly_workout_goals (clerk_id, selected_days, reminder_time) 
				 VALUES ($1, $2, $3) 
				 RETURNING *`,
				[clerk_id, selected_days, reminder_time]
			);
		} else {
			// Update existing weekly goal
			result = await query(
				`UPDATE weekly_workout_goals 
				 SET selected_days = $2, reminder_time = $3, is_active = true, updated_at = NOW() 
				 WHERE clerk_id = $1 
				 RETURNING *`,
				[clerk_id, selected_days, reminder_time]
			);
		}

		return NextResponse.json({ success: true, weeklyGoal: result[0] });
	} catch (error) {
		console.error("POST weekly goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const { clerk_id, selected_days, reminder_time, is_active } = await req.json();

		if (!clerk_id) {
			return NextResponse.json({ success: false, error: "Missing clerk_id" }, { status: 400 });
		}

		// Check if user has a weekly goal
		const existingGoal = await query("SELECT id FROM weekly_workout_goals WHERE clerk_id = $1", [clerk_id]);

		if (existingGoal.length === 0) {
			return NextResponse.json({ success: false, error: "Weekly goal not found" }, { status: 404 });
		}

		// Build update query dynamically based on provided fields
		let updateFields = [];
		let params = [];
		let paramIndex = 1;

		if (selected_days !== undefined) {
			updateFields.push(`selected_days = $${paramIndex++}`);
			params.push(selected_days);
		}

		if (reminder_time !== undefined) {
			updateFields.push(`reminder_time = $${paramIndex++}`);
			params.push(reminder_time);
		}

		if (is_active !== undefined) {
			updateFields.push(`is_active = $${paramIndex++}`);
			params.push(is_active);
		}

		updateFields.push(`updated_at = NOW()`);
		params.push(clerk_id);

		const result = await query(
			`UPDATE weekly_workout_goals 
			 SET ${updateFields.join(", ")} 
			 WHERE clerk_id = $${paramIndex} 
			 RETURNING *`,
			params
		);

		return NextResponse.json({ success: true, weeklyGoal: result[0] });
	} catch (error) {
		console.error("PUT weekly goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const clerk_id = searchParams.get("clerk_id");

		if (!clerk_id) {
			return NextResponse.json({ success: false, error: "Missing clerk_id" }, { status: 400 });
		}

		// Soft delete by setting is_active to false
		const result = await query(
			`UPDATE weekly_workout_goals 
			 SET is_active = false, updated_at = NOW() 
			 WHERE clerk_id = $1 
			 RETURNING *`,
			[clerk_id]
		);

		if (result.length === 0) {
			return NextResponse.json({ success: false, error: "Weekly goal not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("DELETE weekly goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}
