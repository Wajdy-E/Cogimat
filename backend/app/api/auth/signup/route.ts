import bcrypt from "bcrypt";
import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(req: Request) {
	try {
		const { firstName, lastName, email, password } = await req.json();

		if (!email || !password || !firstName || !lastName) {
			return NextResponse.json(
				{ message: "Please fill in all fields" },
				{ status: 400 }
			);
		}
		// Check if the user already exists
		const existingUser = await query("SELECT * FROM users WHERE email=$1", [
			email,
		]);

		if (existingUser.length > 0) {
			return NextResponse.json(
				{ message: "User already exists. Please log in." },
				{ status: 400 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 12);

		// Insert user into DB
		const newUser = await query(
			"INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING *",
			[email, hashedPassword, firstName, lastName]
		);

		// Generate JWT
		const token = jwt.sign({ userId: newUser[0].id, email }, SECRET_KEY!, {
			expiresIn: "7d",
		});

		// Return the JWT token
		return NextResponse.json(
			{
				message: "User registered successfully",
				token: token,
				user: newUser[0],
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Auth Error:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
