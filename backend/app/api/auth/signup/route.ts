import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { UserBase } from "@/type";

export async function POST(req: Request) {
	try {
		const result = await req.json();
		const { email, id, firstName, lastName } = result;

		if (!email || !firstName || !lastName) {
			return NextResponse.json({ message: "Please fill in all fields" }, { status: 400 });
		}

		const existingUser = await query("SELECT * FROM users WHERE email=$1", [email]);

		if (existingUser.length > 0) {
			return NextResponse.json({ message: "User already exists. Please log in." }, { status: 400 });
		}

		const newUser = await query(
			`INSERT INTO users (email, first_name, last_name, clerk_id)
			 VALUES ($1, $2, $3, $4)
			 RETURNING user_id AS "id", 
					   email AS "email", 
					   first_name AS "firstName", 
					   last_name AS "lastName", 
					   creation_date AS "createdAt"`,
			[email, firstName, lastName, id]
		);

		return NextResponse.json(
			{
				message: "User registered successfully",
				user: newUser[0] as UserBase,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Auth Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
