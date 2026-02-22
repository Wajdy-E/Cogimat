import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const {
			name,
			type,
			difficulty,
			instructions,
			isChallenge,
			videoUrl,
			youtubeUrl,
			videos,
			timeToComplete,
			focus,
			isPremium,
			parameters,
			uniqueIdentifier,
		} = body;

		// Build videos JSON for public exercises: prefer body.videos, else build from videoUrl/youtubeUrl
		let videosJson: Record<string, { url: string; isPremium: boolean }> | null = null;
		if (videos && typeof videos === "object") {
			videosJson = videos;
		} else if (videoUrl || youtubeUrl) {
			videosJson = {};
			if (videoUrl) videosJson.mp4 = { url: videoUrl, isPremium: false };
			if (youtubeUrl) videosJson.youtube = { url: youtubeUrl, isPremium: false };
		}

		let stringifyParams = JSON.stringify(parameters);
		const exerciseTime = timeToComplete; // Now stored in seconds
		await query(
			`INSERT INTO exercises (
			  name, type, difficulty, instructions, is_challenge, videos, time_to_complete,
			  focus, parameters, exercise_time, is_premium, unique_identifier
			) VALUES (
			  $1, $2, $3, $4, $5, $6, $7,
			  $8, $9, $10, $11, $12
			)`,
			[
				name,
				type,
				difficulty,
				instructions,
				isChallenge,
				videosJson != null ? JSON.stringify(videosJson) : null,
				timeToComplete,
				focus,
				stringifyParams,
				exerciseTime,
				isPremium,
				uniqueIdentifier,
			]
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error insert new exercise", error);
		return NextResponse.json({ success: false, error: "Database insert failed" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const uniqueIdentifier = searchParams.get("uniqueIdentifier");
		const action = searchParams.get("action"); // "remove" or "unpremium"

		if (!uniqueIdentifier) {
			return NextResponse.json({ success: false, error: "Missing uniqueIdentifier" }, { status: 400 });
		}

		console.log(`Unsubmit exercise: ${uniqueIdentifier}, action: ${action}`);

		if (action === "unpremium") {
			// Set is_premium to false but keep the exercise
			console.log(`Setting is_premium to false for exercise: ${uniqueIdentifier}`);
			await query(`UPDATE exercises SET is_premium = false WHERE unique_identifier = $1`, [uniqueIdentifier]);
		} else {
			// Check if the exercise is premium before deleting
			const exercise = await query(`SELECT is_premium FROM exercises WHERE unique_identifier = $1`, [
				uniqueIdentifier,
			]);

			if (exercise.length === 0) {
				console.log(`Exercise not found: ${uniqueIdentifier}`);
				return NextResponse.json({ success: false, error: "Exercise not found" }, { status: 404 });
			}

			if (exercise[0].is_premium) {
				// Don't delete premium exercises, just return success
				console.log(`Premium exercise not deleted: ${uniqueIdentifier}`);
				return NextResponse.json({ success: true, message: "Premium exercise not deleted" });
			} else {
				// Delete non-premium exercise from the exercises table
				console.log(`Deleting non-premium exercise: ${uniqueIdentifier}`);
				await query(`DELETE FROM exercises WHERE unique_identifier = $1`, [uniqueIdentifier]);
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting exercise from cogipro", error);
		return NextResponse.json({ success: false, error: "Database delete failed" }, { status: 500 });
	}
}
