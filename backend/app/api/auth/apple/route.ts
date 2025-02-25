import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase"; // Ensure this points to your Supabase client setup
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
	try {
		const { token, email } = await req.json();

		if (!token || !email) {
			return NextResponse.json(
				{ error: "Missing token or email" },
				{ status: 400 }
			);
		}

		// Verify Apple identity token (JWT)
		try {
			const decodedToken = jwt.verify(token, process.env.APPLE_PUBLIC_KEY!);
			console.log("Decoded Apple Token:", decodedToken);
		} catch (error) {
			return NextResponse.json(
				{ error: "Invalid Apple token" },
				{ status: 400 }
			);
		}

		// Check if the user exists in Supabase
		const { data: user, error } = await supabase
			.from("users")
			.select("*")
			.eq("email", email)
			.single();

		if (error && error.code === "PGRST116") {
			// User doesn't exist, create a new user
			const { data, error: createUserError } = await supabase
				.from("users")
				.insert([{ email }])
				.select()
				.single();

			if (createUserError) {
				return NextResponse.json(
					{ error: createUserError.message },
					{ status: 500 }
				);
			}

			return NextResponse.json(
				{ message: "User created", user: data },
				{ status: 200 }
			);
		}

		// User exists, return success response
		return NextResponse.json(
			{ message: "User signed in", user },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error handling Apple Sign-In:", error);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
