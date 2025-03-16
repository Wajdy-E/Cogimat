import { Exercise } from "@/type";
import { query } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const exercise = await req.json();
		const result = await query("UPDATE exercises SET is_favourite = $1 where id=$2 RETURNING *", [
			exercise.isFavourited,
			exercise.id,
		]);
		const updatedexercise = result[0];
		return NextResponse.json({ updatedexercise });
	} catch (error) {
		console.error("Get Exercises Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
