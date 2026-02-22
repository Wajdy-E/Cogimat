/**
 * Generate a single page PDF of QR codes (5x10 grid) as a Buffer.
 * Used by the print API to return downloadable PDFs.
 */
const QR_SIZE = 80;
const MARGIN = 10;
const CODES_PER_ROW = 5;

interface QRCodeRow {
	code: string;
}

export async function generateQRCodePDFBuffer(
	qrCodes: QRCodeRow[],
	pageNumber: number
): Promise<Buffer> {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const QRCode = require("qrcode");
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const PDFDocument = require("pdfkit");

	const doc = new PDFDocument({ size: "A4", margin: 40 });
	const chunks: Buffer[] = [];
	doc.on("data", (chunk: Buffer) => chunks.push(chunk));

	doc.fontSize(20).text(`Cogimat QR Codes - Page ${pageNumber}`, { align: "center" });
	doc.moveDown(0.5);
	doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
	doc.moveDown(1);

	for (let i = 0; i < qrCodes.length; i++) {
		const qrCode = qrCodes[i];
		const row = Math.floor(i / CODES_PER_ROW);
		const col = i % CODES_PER_ROW;

		const qrDataURL = await QRCode.toDataURL(qrCode.code, {
			width: QR_SIZE,
			margin: 2,
			color: { dark: "#000000", light: "#FFFFFF" },
		});
		const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, "");
		const imgBuffer = Buffer.from(base64Data, "base64");

		const x = 40 + col * (QR_SIZE + MARGIN);
		const y = 120 + row * (QR_SIZE + 30);

		doc.image(imgBuffer, x, y, { width: QR_SIZE, height: QR_SIZE });
		doc.fontSize(8).text(qrCode.code, x, y + QR_SIZE + 2, { width: QR_SIZE, align: "center" });
	}

	doc.end();

	return new Promise((resolve, reject) => {
		doc.on("end", () => resolve(Buffer.concat(chunks)));
		doc.on("error", reject);
	});
}
