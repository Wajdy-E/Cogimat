import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { clerk_id, exercise_id, is_favourited } = await req.json();
		if (!clerk_id || !exercise_id) {
			return NextResponse.json({ message: "Missing clerk_id or exercise_id" }, { status: 400 });
		}

		let result;

		if (is_favourited) {
			result = await query(
				"INSERT INTO community_exercise_favorites (clerk_id, exercise_id) VALUES ($1, $2) ON CONFLICT (clerk_id, exercise_id) DO NOTHING RETURNING *",
				[clerk_id, exercise_id]
			);
		} else {
			result = await query(
				"DELETE FROM community_exercise_favorites WHERE clerk_id = $1 AND exercise_id = $2 RETURNING *",
				[clerk_id, exercise_id]
			);
		}

		return NextResponse.json({ success: true, updated_favorites: result });
	} catch (error) {
		console.error("Set Community Exercise Favourite Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
