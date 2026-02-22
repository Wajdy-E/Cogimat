import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { query } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
	try {
		const contentType = req.headers.get("content-type");
		console.log("Content-Type:", contentType);

		let data;
		try {
			data = await req.json();
		} catch (jsonError) {
			console.error("JSON parsing error:", jsonError);
			return new Response(
				JSON.stringify({
					error: "Invalid JSON data",
					details: jsonError instanceof Error ? jsonError.message : "Unknown error",
				}),
				{ status: 400 }
			);
		}

		const { title, description, category, adminId, exerciseId, videoData, fileName } = data;

		console.log("Parsed data:", {
			hasVideoData: !!videoData,
			title,
			description,
			category,
			adminId,
			exerciseId,
			fileName,
		});

		if (!videoData || !title || !adminId) {
			return new Response(JSON.stringify({ error: "Video data, title and admin ID are required" }), { status: 400 });
		}

		// Verify admin status
		const adminCheck = await query("SELECT is_admin FROM users WHERE clerk_id = $1", [adminId]);

		if (adminCheck.length === 0 || !adminCheck[0].is_admin) {
			return new Response(JSON.stringify({ error: "Unauthorized: Admin access required" }), { status: 403 });
		}

		let videoUrl: string;
		let fileSize: number;
		let fileContentType: string;

		// Check if videoData is already a Vercel Blob URL or needs to be uploaded
		if (videoData.startsWith("https://") && videoData.includes("blob.vercel-storage.com")) {
			// Already uploaded to Vercel Blob
			videoUrl = videoData;
			fileSize = 0; // We don't have the file size for already uploaded files
			fileContentType = "video/mp4";
		} else {
			// Convert base64 to buffer and upload to Vercel Blob
			const base64Data = videoData.replace(/^data:video\/[a-z]+;base64,/, "");
			const buffer = Buffer.from(base64Data, "base64");
			const filename = `admin-videos/${Date.now()}-${fileName || "video.mp4"}`;
			fileContentType = "video/mp4";

			// Upload to Vercel Blob
			const blob = await put(filename, buffer, {
				access: "public",
				contentType: fileContentType,
			});

			videoUrl = blob.url;
			fileSize = buffer.length;
		}

		// Store in database
		const result = await query(
			`INSERT INTO admin_videos (
				title, 
				description, 
				category, 
				video_url, 
				file_name, 
				file_size, 
				content_type, 
				uploaded_by,
				exercise_id
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
			[
				title,
				description || "",
				category || "exercise-tutorial",
				videoUrl,
				fileName || "video.mp4",
				fileSize,
				fileContentType,
				adminId,
				exerciseId ? parseInt(exerciseId) : null,
			]
		);

		// So the exercise page shows this video, update the exercise's video_url when linked to an exercise
		if (exerciseId) {
			await query("UPDATE exercises SET video_url = $1 WHERE id = $2", [
				videoUrl,
				parseInt(exerciseId),
			]);
		}

		return new Response(
			JSON.stringify({
				success: true,
				id: result[0].id,
				url: videoUrl,
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Admin video upload failed:", error);
		return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
	}
}

export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const category = searchParams.get("category");
		const exerciseId = searchParams.get("exerciseId");

		let queryString =
			"SELECT id, title, description, category, video_url, file_name, file_size, content_type, uploaded_by, exercise_id FROM admin_videos WHERE is_active = true ORDER BY created_at DESC";
		let params: any[] = [];

		if (exerciseId) {
			// Get videos for specific exercise
			queryString =
				"SELECT id, title, description, category, video_url, file_name, file_size, content_type, uploaded_by, exercise_id FROM admin_videos WHERE exercise_id = $1 AND is_active = true ORDER BY created_at DESC";
			params = [parseInt(exerciseId)];
		} else if (category) {
			// Get videos by category (general videos)
			queryString =
				"SELECT id, title, description, category, video_url, file_name, file_size, content_type, uploaded_by, exercise_id FROM admin_videos WHERE category = $1 AND exercise_id IS NULL AND is_active = true ORDER BY created_at DESC";
			params = [category];
		} else {
			// Get all videos
			queryString =
				"SELECT id, title, description, category, video_url, file_name, file_size, content_type, uploaded_by, exercise_id FROM admin_videos WHERE is_active = true ORDER BY created_at DESC";
		}

		const videos = await query(queryString, params);

		return new Response(JSON.stringify({ videos }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Failed to fetch admin videos:", error);
		return new Response(JSON.stringify({ error: "Failed to fetch videos" }), { status: 500 });
	}
}
