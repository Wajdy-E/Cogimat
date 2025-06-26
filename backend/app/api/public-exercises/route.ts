import { query } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const clerkId = searchParams.get("clerkId");

		// Get all public exercises
		const exercises = await query("SELECT * FROM customexercises WHERE public_access = true");

		// If user is authenticated, get their favorites
		let favoriteIds: { exercise_id: number }[] = [];
		if (clerkId) {
			favoriteIds = await query("SELECT exercise_id FROM community_exercise_favorites WHERE clerk_id = $1", [clerkId]);
		}

		// Add favorite status to each exercise
		exercises.forEach((exercise: any) => {
			exercise.isFavourited = favoriteIds.some((fav) => fav.exercise_id === exercise.id);
		});

		return NextResponse.json({ exercises });
	} catch (err) {
		console.error("Get Public Exercises Error:", err);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
