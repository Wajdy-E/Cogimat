import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
	const body = (await request.json()) as HandleUploadBody;

	try {
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
					addRandomSuffix: true,
					tokenPayload: JSON.stringify({ pathname }),
				};
			},
			onUploadCompleted: async ({ blob }) => {
				// Optional: run post-upload logic (e.g. update DB)
				console.log("Blob upload completed:", blob.url);
			},
		});

		return NextResponse.json(jsonResponse);
	} catch (error) {
		console.error("Blob client upload failed:", error);
		return NextResponse.json(
			{ error: (error as Error).message },
			{ status: 400 }
		);
	}
}
