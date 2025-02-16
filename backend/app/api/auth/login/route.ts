import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY;

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ message: "Email and password are required" },
				{ status: 400 }
			);
		}

		const res = await query("SELECT * FROM user WHERE email=$1", [email]);
		if (res.length === 0) {
			return NextResponse.json({ message: "User not found" }, { status: 400 });
		}

		const user = res[0];

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return NextResponse.json(
				{ message: "Invalid credentials" },
				{ status: 400 }
			);
		}

		// Ensure SECRET_KEY is defined
		if (!SECRET_KEY) {
			console.error("JWT_SECRET_KEY is missing in environment variables");
			return NextResponse.json({ message: "Server error" }, { status: 500 });
		}

		// Generate JWT token
		const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, {
			expiresIn: "7d",
		});

		// Remove password before sending user data
		const { password: _, ...safeUserData } = user;

		// Return authenticated user
		return NextResponse.json(
			{ message: "Authenticated", token, user: safeUserData },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Auth Error:", error);
		return NextResponse.json(
			{ message: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
