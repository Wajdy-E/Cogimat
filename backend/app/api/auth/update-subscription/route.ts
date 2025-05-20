import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { userId, isSubscribed } = await req.json();

		if (!userId) {
			return NextResponse.json({ message: "User ID is required" }, { status: 400 });
		}

		await query(
			`UPDATE users 
             SET is_subscribed = $1
             WHERE clerk_id = $2`,
			[isSubscribed, userId]
		);

		return NextResponse.json(
			{
				message: "Subscription status updated successfully",
				isSubscribed,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Subscription Update Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
