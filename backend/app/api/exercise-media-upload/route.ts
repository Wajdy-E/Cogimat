import { NextRequest } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		// Parse JSON data instead of FormData
		const body = await req.json();
		const { fileData, mediaType, exerciseId } = body;

		if (!fileData) {
			return new Response(JSON.stringify({ error: "No file data provided" }), { status: 400 });
		}

		if (!mediaType || !["image", "video"].includes(mediaType)) {
			return new Response(JSON.stringify({ error: "Invalid media type. Must be 'image' or 'video'" }), { status: 400 });
		}

		// Handle base64 data
		const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
		const buffer = Buffer.from(base64Data, "base64");
		const originalName = `upload-${Date.now()}`;
		const contentType = mediaType === "image" ? "image/jpeg" : "video/mp4";

		// Create organized filename with exercise ID and timestamp
		const timestamp = Date.now();
		const fileExtension = mediaType === "image" ? "jpg" : "mp4";
		const filename = `exercise-media/${mediaType}s/${exerciseId ? `exercise-${exerciseId}-` : ""}${timestamp}.${fileExtension}`;

		const blob = await put(filename, buffer, {
			access: "public",
			contentType,
		});

		return new Response(
			JSON.stringify({
				url: blob.url,
				filename: originalName,
				contentType,
				size: buffer.length,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Exercise media upload failed:", error);
		return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
	}
}
