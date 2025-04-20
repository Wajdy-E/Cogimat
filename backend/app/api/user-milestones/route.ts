import { query } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		console.log("hi");
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		const data = await query("SELECT * FROM usermilestones WHERE clerk_id = $1", [userId]);

		return NextResponse.json(data);
	} catch (error) {
		console.error("[USER_MILESTONES_GET]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
