import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { user_id, exercise_id, is_favourited } = await req.json();
		if (!user_id || !exercise_id) {
			return NextResponse.json({ message: "Missing user_id or exercise_id" }, { status: 400 });
		}

		let result;

		if (is_favourited) {
			result = await query(
				"INSERT INTO favorites (user_id, exercise_id) VALUES ($1, $2) ON CONFLICT (user_id, exercise_id) DO NOTHING RETURNING *",
				[user_id, exercise_id]
			);
		} else {
			result = await query("DELETE FROM favorites WHERE user_id = $1 AND exercise_id = $2 RETURNING *", [
				user_id,
				exercise_id,
			]);
		}

		return NextResponse.json({ success: true, updated_favorites: result });
	} catch (error) {
		console.error("Set Favourite Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
