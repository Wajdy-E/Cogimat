import { query } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const rows = await query("SELECT * FROM customexercises WHERE public_access = true");

		return NextResponse.json({ exercises: rows });
	} catch (err) {
		console.error("Get Custom Exercises Error:", err);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
