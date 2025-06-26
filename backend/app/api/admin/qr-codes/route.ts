import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";

export async function POST(req: Request) {
	try {
		const { count = 10000, batchSize = 50 } = await req.json();

		// Generate QR codes using the database function
		await query("SELECT generate_qr_codes($1, $2)", [count, batchSize]);

		return NextResponse.json(
			{
				message: `Successfully generated ${count} QR codes`,
				count,
				batchSize,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("QR Code Generation Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const batchNumber = searchParams.get("batch");
		const page = parseInt(searchParams.get("page") || "1");
		const limit = parseInt(searchParams.get("limit") || "50");
		const offset = (page - 1) * limit;

		let whereClause = "";
		let params: any[] = [];

		if (batchNumber) {
			whereClause = "WHERE batch_number = $1";
			params = [batchNumber];
		}

		// Get QR codes for the specified page/batch
		const qrCodes = await query(
			`SELECT id, code, is_used, used_by, used_at, batch_number, created_at
			 FROM qr_codes 
			 ${whereClause}
			 ORDER BY batch_number, id
			 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
			[...params, limit, offset]
		);

		// Get total count
		const totalCount = await query(`SELECT COUNT(*) as total FROM qr_codes ${whereClause}`, params);

		// Get usage statistics
		const stats = await query(`
			SELECT 
				COUNT(*) as total_codes,
				COUNT(CASE WHEN is_used = true THEN 1 END) as used_codes,
				COUNT(CASE WHEN is_used = false THEN 1 END) as unused_codes,
				COUNT(CASE WHEN is_active = true THEN 1 END) as active_codes
			FROM qr_codes
		`);

		return NextResponse.json({
			qrCodes,
			pagination: {
				page,
				limit,
				total: parseInt(totalCount[0]?.total || "0"),
				totalPages: Math.ceil(parseInt(totalCount[0]?.total || "0") / limit),
			},
			statistics: stats[0],
		});
	} catch (error) {
		console.error("QR Code Retrieval Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
