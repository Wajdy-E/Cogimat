import { query } from "../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
// import axios from "axios";

// async function uploadToBlob(uri: string, type: "image" | "video") {
// 	if (!uri?.startsWith("file://")) return uri;

// 	const res = await fetch(uri);
// 	const blob = await res.blob();

// 	const form = new FormData();
// 	form.append("file", new File([blob], `${type}-${Date.now()}`, { type: blob.type }));

// 	console.log("baseurl", process.env.BASE_URL);
// 	const uploadRes = await axios.post(`${process.env.BASE_URL}/api/blob-upload`, form, {
// 		headers: { "Content-Type": "multipart/form-data" },
// 	});

// 	if (uploadRes.status < 200 || uploadRes.status >= 300) throw new Error("Blob upload failed");
// 	const { url } = uploadRes.data;
// 	return url;
// }

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		const {
			clerk_id,
			name,
			description,
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
			offScreenColor,
			onScreenColor,
			restTime,
			isFavourited,
			publicAccess,
			youtubeUrl,
		} = body;

		// let imageUriBlob = imageUri;
		// let videoUriBlob = videoUri;

		// if (imageUri?.startsWith("file://")) {
		// 	imageUriBlob = await uploadToBlob(imageUri, "image");
		// }
		// if (videoUri?.startsWith("file://")) {
		// 	videoUriBlob = await uploadToBlob(videoUri, "video");
		// }

		const result = await query(
			`INSERT INTO customexercises (
				clerk_id,
				name,
				description,
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
				off_screen_color,
				on_screen_color,
				rest_time,
				is_favourited,
				public_access,
				youtube_url
			) VALUES (
				$1, $2, $3, $4, $5,
				$6, $7, $8, $9, $10,
				$11, $12, $13, $14, $15,
				$16, $17, $18, $19, $20, $21
			) RETURNING id`,
			[
				clerk_id,
				name,
				description,
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
				offScreenColor,
				onScreenColor,
				restTime,
				isFavourited,
				publicAccess,
				youtubeUrl,
			]
		);

		return NextResponse.json({ success: true, id: result[0].id });
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
			description,
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
			offScreenColor,
			onScreenColor,
			restTime,
			publicAccess,
			youtubeUrl,
		} = body;

		if (!id || !clerk_id) {
			return new NextResponse(JSON.stringify({ error: "Missing id or clerk_id" }), { status: 400 });
		}

		await query(
			`UPDATE customexercises SET
				name = $1,
				description = $2,
				instructions = $3,
				difficulty = $4,
				shapes = $5,
				letters = $6,
				numbers = $7,
				colors = $8,
				focus = $9,
				image_uri = $10,
				video_uri = $11,
				off_screen_time = $12,
				on_screen_time = $13,
				exercise_time = $14,
				off_screen_color = $15,
				on_screen_color = $16,
				rest_time = $17,
				is_favourited = $20,
				public_access = $21,
				youtube_url = $22,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = $18 AND clerk_id = $19`,
			[
				name,
				description,
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
				offScreenColor,
				onScreenColor,
				restTime,
				id,
				clerk_id,
				isFavourited,
				publicAccess,
				youtubeUrl,
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
