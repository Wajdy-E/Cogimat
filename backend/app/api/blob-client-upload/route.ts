import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
	return NextResponse.json({
		message: "Blob client upload endpoint. Use POST with body { type: 'blob.generate-client-token', payload: { pathname, callbackUrl, clientPayload, multipart } } to get an upload token.",
	});
}

export async function POST(request: Request): Promise<NextResponse> {
	console.log("[blob-client-upload] POST received");
	try {
		const body = (await request.json()) as HandleUploadBody;

		if (!body?.type || !body?.payload) {
			return NextResponse.json(
				{ error: "Invalid request: missing type or payload" },
				{ status: 400 }
			);
		}

		if (!process.env.BLOB_READ_WRITE_TOKEN) {
			console.error("Blob client upload: BLOB_READ_WRITE_TOKEN is not set");
			return NextResponse.json(
				{ error: "Server misconfiguration: blob storage not configured" },
				{ status: 503 }
			);
		}

		const jsonResponse = await handleUpload({
			body,
			request,
			onBeforeGenerateToken: async (pathname) => {
				return {
					allowedContentTypes: [
						"video/mp4",
						"video/quicktime",
						"video/x-msvideo",
						"video/webm",
						"image/jpeg",
						"image/png",
						"image/webp",
					],
					maximumSizeInBytes: 500 * 1024 * 1024, // 500MB
					addRandomSuffix: false, // Client needs to know exact pathname for upload URL
					tokenPayload: JSON.stringify({ pathname }),
				};
			},
			onUploadCompleted: async ({ blob }) => {
				console.log("Blob upload completed:", blob.url);
			},
		});

		return NextResponse.json(jsonResponse);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Blob upload failed";
		console.error("Blob client upload failed:", error);
		return NextResponse.json({ error: message }, { status: 400 });
	}
}
