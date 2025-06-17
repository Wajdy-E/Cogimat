import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const {
			name,
			type,
			difficulty,
			description,
			instructions,
			isChallenge,
			videoUrl,
			timeToComplete,
			focus,
			imageFileName,
			isPremium,
			parameters,
		} = body;

		let stringifyParams = JSON.stringify(parameters);
		const exerciseTime = timeToComplete / 60;
		await query(
			`INSERT INTO exercises (
			  name, type, difficulty, description, instructions, is_challenge, video_url, time_to_complete, 
			  focus, parameters, exercise_time, is_premium, image_file_name
			) VALUES (
			  $1, $2, $3, $4, $5, $6, $7, $8,
			  $9, $10, $11, $12, $13
			)`,
			[
				name,
				type,
				difficulty,
				description,
				instructions,
				isChallenge,
				videoUrl,
				timeToComplete,
				focus,
				stringifyParams,
				exerciseTime,
				isPremium,
				imageFileName,
			]
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error insert new exercise", error);
		return NextResponse.json({ success: false, error: "Database insert failed" }, { status: 500 });
	}
}
