import { Exercise } from "@/type";
import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
	try {
		const exercises: Exercise[] = await query("SELECT * FROM exercises");
		return NextResponse.json({ exercises });
	} catch (error) {
		console.error("Get Exercises Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
