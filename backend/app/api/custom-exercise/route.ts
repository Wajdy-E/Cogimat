import { query } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

async function uploadToBlob(uri: string, type: "image" | "video", exerciseId?: number) {
	if (!uri?.startsWith("file://")) return uri;

	try {
		const res = await fetch(uri);
		const blob = await res.blob();
		const arrayBuffer = await blob.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Create organized filename
		const timestamp = Date.now();
		const fileExtension = type === "image" ? "jpg" : "mp4";
		const filename = `exercise-media/${type}s/${exerciseId ? `exercise-${exerciseId}-` : ""}${timestamp}.${fileExtension}`;

		const vercelBlob = await put(filename, buffer, {
			access: "public",
			contentType: blob.type,
		});

		return vercelBlob.url;
	} catch (error) {
		console.error(`Failed to upload ${type} to blob:`, error);
		throw new Error(`Blob upload failed for ${type}`);
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const {
			clerk_id,
			name,
			instructions,
			difficulty,
			shapes,
			letters,
			numbers,
			colors,
			focus,
			imageUri,
			videoUri,
			offScreenTime,
			onScreenTime,
			exerciseTime,
			isFavourited,
			publicAccess,
			youtubeUrl,
		} = body;

		let imageUriBlob = imageUri;
		let videoUriBlob = videoUri;

		// Upload images and videos to Vercel Blob if they are local files
		if (imageUri?.startsWith("file://")) {
			imageUriBlob = await uploadToBlob(imageUri, "image");
		}
		if (videoUri?.startsWith("file://")) {
			videoUriBlob = await uploadToBlob(videoUri, "video");
		}

		const result = await query(
			`INSERT INTO customexercises (
				clerk_id,
				name,
				instructions,
				difficulty,
				shapes,
				letters,
				numbers,
				colors,
				focus,
				image_uri,
				video_uri,
				off_screen_time,
				on_screen_time,
				exercise_time,
				is_favourited,
				public_access,
				youtube_url
			) VALUES (
				$1, $2, $3, $4,
				$5, $6, $7, $8,
				$9, $10, $11, $12,
				$13, $14, $15, $16, $17
			) RETURNING id, unique_identifier`,
			[
				clerk_id,
				name,
				instructions,
				difficulty,
				shapes,
				letters,
				numbers,
				colors,
				focus,
				imageUriBlob,
				videoUriBlob,
				offScreenTime,
				onScreenTime,
				exerciseTime,
				isFavourited,
				publicAccess,
				youtubeUrl,
			]
		);

		return NextResponse.json({ success: true, id: result[0].id, unique_identifier: result[0].unique_identifier });
	} catch (error) {
		console.error("Create Exercise Error:", error);
		return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
	}
}

export async function PATCH(req: NextRequest) {
	try {
		const body = await req.json();
		const {
			id,
			clerk_id,
			name,
			instructions,
			difficulty,
			shapes,
			letters,
			numbers,
			colors,
			focus,
			imageUri,
			videoUri,
			isFavourited,
			offScreenTime,
			onScreenTime,
			exerciseTime,
			publicAccess,
			youtubeUrl,
			submittedToCogipro,
			isPremium,
		} = body;

		if (!id || !clerk_id) {
			return new NextResponse(JSON.stringify({ error: "Missing id or clerk_id" }), { status: 400 });
		}

		console.log(isFavourited);
		let imageUriBlob = imageUri;
		let videoUriBlob = videoUri;

		// Upload new images and videos to Vercel Blob if they are local files
		if (imageUri?.startsWith("file://")) {
			imageUriBlob = await uploadToBlob(imageUri, "image", id);
		}
		if (videoUri?.startsWith("file://")) {
			videoUriBlob = await uploadToBlob(videoUri, "video", id);
		}

		await query(
			`UPDATE customexercises SET
				name = $1,
				instructions = $2,
				difficulty = $3,
				shapes = $4,
				letters = $6,
				numbers = $7,
				colors = $8,
				focus = $9,
				image_uri = $10,
				video_uri = $11,
				is_favourited = $12,
				off_screen_time = $13,
				on_screen_time = $14,
				exercise_time = $15,
				public_access = $16,
				youtube_url = $17,
				updated_at = CURRENT_TIMESTAMP,
				submitted_to_cogipro = $18,
				is_premium = $19
			WHERE id = $20 AND clerk_id = $21`,
			[
				name,
				instructions,
				difficulty,
				shapes,
				letters,
				numbers,
				colors,
				focus,
				imageUriBlob,
				videoUriBlob,
				isFavourited,
				offScreenTime,
				onScreenTime,
				exerciseTime,
				publicAccess,
				youtubeUrl,
				submittedToCogipro,
				isPremium,
				id,
				clerk_id,
			]
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Update Exercise Error:", error);
		return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const clerk_id = searchParams.get("clerk_id");

		if (!clerk_id) {
			return new NextResponse(JSON.stringify({ error: "Missing clerk_id" }), { status: 400 });
		}

		const rows = await query("SELECT * FROM customexercises WHERE clerk_id = $1", [clerk_id]);

		return NextResponse.json({ exercises: rows });
	} catch (err) {
		console.error("Get Custom Exercises Error:", err);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const { id, clerk_id } = await req.json();

		if (!id || !clerk_id) {
			return new NextResponse(JSON.stringify({ error: "Missing id or clerk_id" }), { status: 400 });
		}

		await query("DELETE FROM customexercises WHERE id = $1 AND clerk_id = $2", [id, clerk_id]);

		return NextResponse.json({ success: true });
	} catch (err) {
		console.error("Delete Custom Exercise Error:", err);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
