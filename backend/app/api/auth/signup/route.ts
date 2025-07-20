import { query } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { UserBase } from "@/type";

export async function POST(req: Request) {
	try {
		const result = await req.json();
		const { email, id, firstName, lastName, qrCode } = result;

		if (!email || !firstName || !lastName) {
			return NextResponse.json({ message: "signup.errors.missingFields" }, { status: 400 });
		}

		const existingUser = await query("SELECT * FROM users WHERE email=$1", [email]);

		if (existingUser.length > 0) {
			return NextResponse.json({ message: "signup.userExists.message" }, { status: 400 });
		}

		let hasQrAccess = false;
		if (qrCode) {
			const qrValidation = await query("SELECT use_qr_code($1, $2) as is_valid", [qrCode, id]);
			const isValid = qrValidation[0]?.is_valid;

			if (!isValid) {
				return NextResponse.json(
					{
						message: "qrSignup.invalidQRCode",
					},
					{ status: 400 }
				);
			}
			hasQrAccess = true;
		}

		const newUser = await query(
			`INSERT INTO users (email, first_name, last_name, clerk_id, has_qr_access)
			 VALUES ($1, $2, $3, $4, $5)
			 RETURNING user_id AS "id", 
					   email AS "email", 
					   first_name AS "firstName", 
					   last_name AS "lastName", 
					   creation_date AS "createdAt",
					   has_qr_access AS "hasQrAccess",
					   is_admin AS "isAdmin"`,
			[email, firstName, lastName, id, hasQrAccess]
		);

		return NextResponse.json(
			{
				message: hasQrAccess ? "User registered successfully with QR code access" : "User registered successfully",
				user: newUser[0] as UserBase,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Auth Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
