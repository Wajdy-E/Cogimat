import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const batchNumber = searchParams.get("batch");
		const page = parseInt(searchParams.get("page") || "1");
		const codesPerPage = 50;

		let whereClause = "";
		let params: any[] = [];

		if (batchNumber) {
			whereClause = "WHERE batch_number = $1";
			params = [batchNumber];
		}

		// Calculate the range for this page
		const startId = (page - 1) * codesPerPage + 1;
		const endId = page * codesPerPage;

		// Get QR codes for this specific page
		const qrCodes = await query(
			`SELECT id, code, batch_number
			 FROM qr_codes 
			 ${whereClause}
			 AND id BETWEEN $${params.length + 1} AND $${params.length + 2}
			 ORDER BY id`,
			[...params, startId, endId]
		);

		// Get total pages
		const totalCount = await query(`SELECT COUNT(*) as total FROM qr_codes ${whereClause}`, params);
		const totalPages = Math.ceil(parseInt(totalCount[0]?.total || "0") / codesPerPage);

		// Format codes for printing (5x10 grid)
		const formattedCodes = [];
		for (let i = 0; i < qrCodes.length; i += 10) {
			const row = qrCodes.slice(i, i + 10);
			formattedCodes.push(row);
		}

		return NextResponse.json({
			page,
			totalPages,
			codesPerPage,
			qrCodes: formattedCodes,
			printData: {
				pageTitle: `Cogimat QR Codes - Page ${page}`,
				generatedAt: new Date().toISOString(),
				instructions: "Scan this QR code with the Cogimat app to gain access to all basic features.",
				contactInfo: "For support, contact: support@cogimat.com",
			},
		});
	} catch (error) {
		console.error("QR Code Print Generation Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}
