import { NextResponse } from "next/server";
import { query } from "../../../../../lib/db";
import { generateQRCodePDFBuffer } from "../../../../lib/qr-pdf";

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const batchNumber = searchParams.get("batch");
		const page = parseInt(searchParams.get("page") || "1");
		const format = searchParams.get("format");
		const codesPerPage = 50;

		const offset = (page - 1) * codesPerPage;

		let whereClause = "";
		let params: (string | number)[] = [];

		if (batchNumber) {
			whereClause = "WHERE batch_number = $1";
			params = [batchNumber];
		}

		const limitParam = params.length + 1;
		const offsetParam = params.length + 2;

		const qrCodes = await query(
			`SELECT id, code, batch_number
			 FROM qr_codes 
			 ${whereClause}
			 ORDER BY id
			 LIMIT $${limitParam} OFFSET $${offsetParam}`,
			[...params, codesPerPage, offset],
		);

		// Return PDF for download when format=pdf
		if (format === "pdf" && Array.isArray(qrCodes) && qrCodes.length > 0) {
			const pdfBuffer = await generateQRCodePDFBuffer(
				qrCodes.map((r: { code: string }) => ({ code: r.code })),
				page,
			);
			const filename = `qr-codes-page-${String(page).padStart(3, "0")}.pdf`;
			return new NextResponse(new Uint8Array(pdfBuffer), {
				status: 200,
				headers: {
					"Content-Type": "application/pdf",
					"Content-Disposition": `attachment; filename="${filename}"`,
					"Content-Length": String(pdfBuffer.length),
				},
			});
		}

		const totalCount = await query(`SELECT COUNT(*) as total FROM qr_codes ${whereClause}`, params);
		const totalPages = Math.ceil(parseInt(totalCount[0]?.total || "0") / codesPerPage);

		const formattedCodes = [];
		for (let i = 0; i < qrCodes.length; i += 10) {
			formattedCodes.push(qrCodes.slice(i, i + 10));
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
