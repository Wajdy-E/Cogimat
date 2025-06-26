const { Pool } = require("pg");
const QRCode = require("qrcode");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();
const PDFDocument = require("pdfkit");

// Database connection - use the same connection string as the main app
const pool = new Pool({
	connectionString: process.env.SUPABASE_CONNECTION_STRING,
});

// Configuration
const CODES_PER_PAGE = 50;
const QR_SIZE = 80; // pixels (for PDF)
const MARGIN = 10; // pixels
const CODES_PER_ROW = 5;
const CODES_PER_COL = 10;

async function generateQRCodeImage(text) {
	try {
		const qrDataURL = await QRCode.toDataURL(text, {
			width: QR_SIZE,
			margin: 2,
			color: {
				dark: "#000000",
				light: "#FFFFFF",
			},
		});
		return qrDataURL;
	} catch (error) {
		console.error("Error generating QR code:", error);
		return null;
	}
}

async function createQRCodePDFPage(qrCodes, pageNumber, outputDir) {
	const doc = new PDFDocument({
		size: "A4",
		margin: 40,
	});
	const filename = `qr-codes-page-${pageNumber.toString().padStart(3, "0")}.pdf`;
	const filepath = path.join(outputDir, filename);
	const stream = require("fs").createWriteStream(filepath);
	doc.pipe(stream);

	// Header
	doc.fontSize(20).text(`Cogimat QR Codes - Page ${pageNumber}`, { align: "center" });
	doc.moveDown(0.5);
	doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
	doc.moveDown(1);

	// Grid settings
	for (let i = 0; i < qrCodes.length; i++) {
		const qrCode = qrCodes[i];
		const row = Math.floor(i / CODES_PER_ROW);
		const col = i % CODES_PER_ROW;

		// Generate QR code image as Data URL
		const qrDataURL = await generateQRCodeImage(qrCode.code);
		const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, "");
		const imgBuffer = Buffer.from(base64Data, "base64");

		// Calculate position
		const x = 40 + col * (QR_SIZE + MARGIN);
		const y = 120 + row * (QR_SIZE + 30);

		// Draw QR code image
		doc.image(imgBuffer, x, y, { width: QR_SIZE, height: QR_SIZE });

		// Draw code text
		doc.fontSize(8).text(qrCode.code, x, y + QR_SIZE + 2, { width: QR_SIZE, align: "center" });
	}

	doc.end();

	// Wait for the PDF to finish writing
	await new Promise((resolve) => stream.on("finish", resolve));
	return filepath;
}

async function generateAllQRCodePages() {
	try {
		console.log("Fetching QR codes from database...");

		// Get all QR codes
		const result = await pool.query(`
			SELECT id, code, batch_number 
			FROM qr_codes 
			ORDER BY id
		`);

		const qrCodes = result.rows;
		console.log(`Found ${qrCodes.length} QR codes`);

		if (qrCodes.length === 0) {
			console.log("No QR codes found. Please generate QR codes first.");
			return;
		}

		// Create output directory
		const outputDir = path.join(__dirname, "../qr-codes-output");
		await fs.mkdir(outputDir, { recursive: true });

		// Generate pages
		const totalPages = Math.ceil(qrCodes.length / CODES_PER_PAGE);
		console.log(`Generating ${totalPages} PDF pages...`);

		for (let page = 1; page <= totalPages; page++) {
			const startIndex = (page - 1) * CODES_PER_PAGE;
			const endIndex = Math.min(startIndex + CODES_PER_PAGE, qrCodes.length);
			const pageCodes = qrCodes.slice(startIndex, endIndex);

			console.log(`Generating PDF page ${page}/${totalPages} with ${pageCodes.length} codes...`);
			await createQRCodePDFPage(pageCodes, page, outputDir);
			console.log(`Saved: qr-codes-page-${page.toString().padStart(3, "0")}.pdf`);
		}

		console.log(`\nQR code PDF pages generated successfully in: ${outputDir}`);
		console.log(`Total pages: ${totalPages}`);
		console.log(`Total QR codes: ${qrCodes.length}`);
	} catch (error) {
		console.error("Error generating QR code PDF pages:", error);
	} finally {
		await pool.end();
	}
}

// Run the script
if (require.main === module) {
	generateAllQRCodePages();
}

module.exports = { generateAllQRCodePages, createQRCodePDFPage };
