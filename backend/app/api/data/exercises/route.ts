import { Exercise } from "@/type";
import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		type FavoriteId = {
			exercise_id: number;
		};

		const [exercises, favoriteIds]: [Exercise[], FavoriteId[]] = await Promise.all([
			query("SELECT * FROM exercises"),
			query("SELECT exercise_id FROM favorites WHERE user_id = $1", [userId]),
		]);

		exercises.forEach((exercise) => {
			exercise.isFavourited = favoriteIds.some((fav) => fav.exercise_id === exercise.id);
		});

		console.log(exercises);
		return NextResponse.json({ exercises });
	} catch (error) {
		console.error("Get Exercises Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
