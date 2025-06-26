import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

export interface RoutineExercise {
	exercise_id: number;
	exercise_type: "standard" | "custom";
	order: number;
}

export interface Routine {
	id: number;
	clerk_id: string;
	name: string;
	description?: string;
	exercises: RoutineExercise[];
	is_active: boolean;
	created_at: string;
	updated_at: string;
	last_completed_at?: string;
	completion_count: number;
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const clerk_id = searchParams.get("clerk_id");

		if (!clerk_id) {
			return NextResponse.json({ success: false, error: "clerk_id is required" }, { status: 400 });
		}

		const routines = await query(
			"SELECT * FROM routines WHERE clerk_id = $1 AND is_active = true ORDER BY created_at DESC",
			[clerk_id]
		);

		const parsedRoutines = routines.map((routine) => ({
			...routine,
			exercises: typeof routine.exercises === "string" ? JSON.parse(routine.exercises) : routine.exercises || [],
		}));

		return NextResponse.json({ success: true, routines: parsedRoutines });
	} catch (error) {
		console.error("Error fetching routines:", error);
		return NextResponse.json({ success: false, error: "Database query failed" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const { clerk_id, name, description, exercises } = await req.json();

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
			`INSERT INTO routines (clerk_id, name, description, exercises) 
			 VALUES ($1, $2, $3, $4) 
			 RETURNING *`,
			[clerk_id, name, description || null, JSON.stringify(exercises)]
		);

		return NextResponse.json({ success: true, routine: result[0] });
	} catch (error) {
		console.error("Error creating routine:", error);
		return NextResponse.json({ success: false, error: "Database insert failed" }, { status: 500 });
	}
}
