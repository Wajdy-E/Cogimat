import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { createClerkClient } from "@clerk/backend";

export async function DELETE(req: Request) {
	try {
		const { userId } = await req.json();

		if (!userId) {
			return NextResponse.json({ error: "User ID missing" }, { status: 400 });
		}

		const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
		const response = await clerkClient.users.deleteUser(userId);
		await query("DELETE FROM users WHERE clerk_id = $1", [userId]);

		return NextResponse.json({ message: "User has been successfully deleted" }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: "An error occurred while deleting the user" }, { status: 500 });
	}
}
