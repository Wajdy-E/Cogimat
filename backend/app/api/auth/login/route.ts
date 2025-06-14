import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { UserBase } from "@/type";

export async function POST(req: Request) {
	try {
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
		}

		const res = await query(
			`SELECT 
			   user_id AS "userId", 
			   email AS "email", 
			   first_name AS "firstName", 
			   last_name AS "lastName", 
			   username AS "username", 
			   creation_date AS "createdAt",
			   is_admin AS "isAdmin"
			 FROM users 
			 WHERE email = $1`,
			[email]
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
