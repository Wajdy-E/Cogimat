import { NextRequest } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const file = formData.get("file") as File | null;

		if (!file || typeof file === "string") {
			return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const filename = file.name || `upload-${Date.now()}`;
		const contentType = file.type || "application/octet-stream";

		const blob = await put(filename, buffer, {
			access: "public",
			contentType,
		});

		return new Response(JSON.stringify({ url: blob.url }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Upload failed:", error);
		return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
	}
}
