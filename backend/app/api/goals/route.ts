import { Goals } from "@/type";
import { query } from "../../../lib/db";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const user_id = searchParams.get("user_id");

		if (!user_id) {
			return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 400 });
		}

		const result = await query("SELECT goals FROM goals WHERE user_id = $1", [user_id]);
		const goals = result[0]?.goals;

		// If the row exists but goals is not an array, wrap it
		const parsedGoals = Array.isArray(goals) ? goals : goals ? [goals] : [];

		return NextResponse.json({ success: true, goals: parsedGoals });
	} catch (error) {
		console.error("GET goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

export async function POST(req: Request) {
	try {
		const { user_id, newGoal } = await req.json();

		if (!user_id || !newGoal || !newGoal.goal) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		const goalWithId: Goals = {
			id: randomUUID(),
			goal: newGoal.goal,
			completed: newGoal.completed ?? false,
		};

		const result = await query("SELECT goals FROM goals WHERE user_id = $1", [user_id]);

		if (result.length === 0) {
			// Insert new row with array of one goal
			await query("INSERT INTO goals (user_id, goals) VALUES ($1, $2)", [user_id, JSON.stringify([goalWithId])]);
		} else {
			const currentGoals = Array.isArray(result[0]?.goals) ? result[0].goals : [result[0]?.goals];
			currentGoals.push(goalWithId);

			await query("UPDATE goals SET goals = $1, updated_at = NOW() WHERE user_id = $2", [
				JSON.stringify(currentGoals),
				user_id,
			]);
		}

		return NextResponse.json({ success: true, goal: goalWithId });
	} catch (error) {
		console.error("POST goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

export async function PUT(req: Request) {
	try {
		const { user_id, newGoal } = await req.json();

		if (!user_id) {
			return NextResponse.json({ success: false, error: "Missing or invalid fields" }, { status: 400 });
		}

		const result = await query("SELECT goals FROM goals WHERE user_id = $1", [user_id]);

		if (result.length === 0) {
			await query("INSERT INTO goals (user_id, goals) VALUES ($1, $2)", [user_id, JSON.stringify(newGoal)]);
		} else {
			await query("UPDATE goals SET goals = $1, updated_at = NOW() WHERE user_id = $2", [
				JSON.stringify(newGoal),
				user_id,
			]);
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("PUT goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}

export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const user_id = searchParams.get("user_id");
		const goal_id = searchParams.get("goal_id");

		if (!user_id || !goal_id) {
			return NextResponse.json({ success: false, error: "Missing user_id or goal_id" }, { status: 400 });
		}

		const result = await query("SELECT goals FROM goals WHERE user_id = $1", [user_id]);

		if (result.length === 0) {
			return NextResponse.json({ success: false, error: "User has no goals" }, { status: 404 });
		}

		const currentGoals = Array.isArray(result[0]?.goals) ? result[0].goals : [result[0]?.goals];

		const updatedGoals = currentGoals.filter((g: Goals) => g.id !== goal_id);

		await query("UPDATE goals SET goals = $1, updated_at = NOW() WHERE user_id = $2", [
			JSON.stringify(updatedGoals),
			user_id,
		]);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("DELETE goals error:", error);
		return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
	}
}
