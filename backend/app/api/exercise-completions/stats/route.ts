import { query } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const userId = searchParams.get("userId");

		if (!userId) {
			return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
		}

		// Get current date boundaries
		const now = new Date();
		const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const startOfThisWeek = new Date(startOfToday);
		startOfThisWeek.setDate(startOfToday.getDate() - startOfToday.getDay()); // Start of week (Sunday)

		const startOfLastWeek = new Date(startOfThisWeek);
		startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

		const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		// Query for this week
		const thisWeekResult = await query(
			`SELECT COUNT(*) as count 
			FROM exercise_completions 
			WHERE clerk_id = $1 AND completed_at >= $2`,
			[userId, startOfThisWeek.toISOString()]
		);

		// Query for last week
		const lastWeekResult = await query(
			`SELECT COUNT(*) as count 
			FROM exercise_completions 
			WHERE clerk_id = $1 AND completed_at >= $2 AND completed_at < $3`,
			[userId, startOfLastWeek.toISOString(), startOfThisWeek.toISOString()]
		);

		// Query for this month
		const thisMonthResult = await query(
			`SELECT COUNT(*) as count 
			FROM exercise_completions 
			WHERE clerk_id = $1 AND completed_at >= $2`,
			[userId, startOfThisMonth.toISOString()]
		);

		// Query for today
		const todayResult = await query(
			`SELECT COUNT(*) as count 
			FROM exercise_completions 
			WHERE clerk_id = $1 AND completed_at >= $2`,
			[userId, startOfToday.toISOString()]
		);

		// Query for daily breakdown of this week
		const dailyBreakdownResult = await query(
			`SELECT 
				DATE(completed_at) as date,
				COUNT(*) as count
			FROM exercise_completions 
			WHERE clerk_id = $1 AND completed_at >= $2
			GROUP BY DATE(completed_at)
			ORDER BY DATE(completed_at) ASC`,
			[userId, startOfThisWeek.toISOString()]
		);

		const stats = {
			thisWeek: parseInt(thisWeekResult[0]?.count || "0"),
			lastWeek: parseInt(lastWeekResult[0]?.count || "0"),
			thisMonth: parseInt(thisMonthResult[0]?.count || "0"),
			today: parseInt(todayResult[0]?.count || "0"),
			dailyBreakdown: dailyBreakdownResult.map((row: any) => ({
				date: row.date,
				count: parseInt(row.count || "0"),
			})),
		};

		return NextResponse.json({ success: true, stats });
	} catch (error) {
		console.error("[EXERCISE_COMPLETIONS_STATS_GET]", error);
		return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
	}
}
