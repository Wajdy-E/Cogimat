import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { UserBase } from "@/type";

export async function GET(req: Request) {
	try {
		// const { email } = await req.json();
		const { searchParams } = new URL(req.url);
		const clerk_id = searchParams.get("clerk_id");

		if (!clerk_id) {
			return NextResponse.json({ message: "Clerk ID is required" }, { status: 400 });
		}

		const res = await query(
			`SELECT 
			   clerk_id AS "id", 
			   email AS "email", 
			   first_name AS "firstName", 
			   last_name AS "lastName", 
			   username AS "username", 
			   creation_date AS "createdAt",
			   is_admin AS "isAdmin",
			   has_qr_access AS "hasQrAccess"
			 FROM users 
			 WHERE clerk_id = $1`,
			[clerk_id]
		);

		if (res.length === 0) {
			return NextResponse.json({ message: "User not found" }, { status: 400 });
		}

		const user = res[0];

		// Return authenticated user
		return NextResponse.json({ message: "Authenticated", user: user as UserBase }, { status: 200 });
	} catch (error) {
		console.error("Auth Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
