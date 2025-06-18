import { query } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		const data = await query("SELECT * FROM usermilestones WHERE clerk_id = $1", [userId]);

		return NextResponse.json(data);
	} catch (error) {
		console.error("[USER_MILESTONES_GET]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const { userId, milestoneType, exerciseDifficulty } = await req.json();

		if (!userId || !milestoneType) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		// Check if user has a milestone record
		const existingRecord = await query("SELECT * FROM usermilestones WHERE clerk_id = $1", [userId]);

		if (existingRecord.length === 0) {
			// Create new record with default values
			await query(
				`INSERT INTO usermilestones (
					clerk_id, exercisescompleted, beginnerexercisescompleted, 
					intermediateexercisescompleted, advancedexercisescompleted, 
					communityexercisescompleted, customexercisescompleted, 
					customexercisescreated, goalscreated, educationalarticlescompleted
				) VALUES ($1, 0, 0, 0, 0, 0, 0, 0, 0, 0)`,
				[userId]
			);
		}

		// Update the specific milestone
		let updateQuery = "";
		let params = [userId];

		switch (milestoneType) {
			case "exercisesCompleted":
				updateQuery = "UPDATE usermilestones SET exercisescompleted = exercisescompleted + 1 WHERE clerk_id = $1";
				break;
			case "beginnerExercisesCompleted":
				updateQuery =
					"UPDATE usermilestones SET beginnerexercisescompleted = beginnerexercisescompleted + 1 WHERE clerk_id = $1";
				break;
			case "intermediateExercisesCompleted":
				updateQuery =
					"UPDATE usermilestones SET intermediateexercisescompleted = intermediateexercisescompleted + 1 WHERE clerk_id = $1";
				break;
			case "advancedExercisesCompleted":
				updateQuery =
					"UPDATE usermilestones SET advancedexercisescompleted = advancedexercisescompleted + 1 WHERE clerk_id = $1";
				break;
			case "communityExercisesCompleted":
				updateQuery =
					"UPDATE usermilestones SET communityexercisescompleted = communityexercisescompleted + 1 WHERE clerk_id = $1";
				break;
			case "customExercisesCompleted":
				updateQuery =
					"UPDATE usermilestones SET customexercisescompleted = customexercisescompleted + 1 WHERE clerk_id = $1";
				break;
			case "customExercisesCreated":
				updateQuery =
					"UPDATE usermilestones SET customexercisescreated = customexercisescreated + 1 WHERE clerk_id = $1";
				break;
			case "goalsCreated":
				updateQuery = "UPDATE usermilestones SET goalscreated = goalscreated + 1 WHERE clerk_id = $1";
				break;
			case "educationalArticlesCompleted":
				updateQuery =
					"UPDATE usermilestones SET educationalarticlescompleted = educationalarticlescompleted + 1 WHERE clerk_id = $1";
				break;
			default:
				return NextResponse.json({ success: false, error: "Invalid milestone type" }, { status: 400 });
		}

		await query(updateQuery, params);

		// If this is an exercise completion, also update the total and difficulty-specific counters
		if (milestoneType.includes("ExercisesCompleted") && exerciseDifficulty) {
			// Update total exercises completed (only if not already updated by the specific milestone)
			if (milestoneType !== "exercisesCompleted") {
				await query("UPDATE usermilestones SET exercisescompleted = exercisescompleted + 1 WHERE clerk_id = $1", [
					userId,
				]);
			}

			// Update difficulty-specific counter (only if not already updated by the specific milestone)
			if (!milestoneType.includes(exerciseDifficulty.toLowerCase())) {
				switch (exerciseDifficulty.toLowerCase()) {
					case "beginner":
						await query(
							"UPDATE usermilestones SET beginnerexercisescompleted = beginnerexercisescompleted + 1 WHERE clerk_id = $1",
							[userId]
						);
						break;
					case "intermediate":
						await query(
							"UPDATE usermilestones SET intermediateexercisescompleted = intermediateexercisescompleted + 1 WHERE clerk_id = $1",
							[userId]
						);
						break;
					case "advanced":
						await query(
							"UPDATE usermilestones SET advancedexercisescompleted = advancedexercisescompleted + 1 WHERE clerk_id = $1",
							[userId]
						);
						break;
				}
			}
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[USER_MILESTONES_PATCH]", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
