import axios from "axios";
import { upload } from "@vercel/blob/client";

const BASE_URL = process.env.BASE_URL;

export interface MediaUploadResult {
	url: string;
	filename: string;
	contentType: string;
	size: number;
}

/**
 * Upload video using Vercel Blob client upload (direct to Blob, bypasses 4.5MB server limit).
 */
async function uploadVideoDirect(uri: string, exerciseId?: number): Promise<MediaUploadResult> {
	const response = await fetch(uri);
	const blob = await response.blob();
	const name = uri.split("/").pop() ?? `video-${Date.now()}.mp4`;

	const result = await upload(name, blob, {
		access: "public",
		handleUploadUrl: `${BASE_URL}/api/blob-client-upload`,
		contentType: "video/mp4",
	});

	return {
		url: result.url,
		filename: name,
		contentType: "video/mp4",
		size: blob.size,
	};
}

/**
 * Upload image using base64 (images are typically small enough for the 4.5MB limit).
 */
async function uploadImageBase64(uri: string, exerciseId?: number): Promise<MediaUploadResult> {
	const response = await fetch(uri);
	const blob = await response.blob();

	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = async () => {
			try {
				const base64Data = reader.result as string;
				const payload = {
					fileData: base64Data,
					mediaType: "image",
					exerciseId: exerciseId?.toString(),
				};

				const res = await axios.post(`${BASE_URL}/api/exercise-media-upload`, payload, {
					headers: { "Content-Type": "application/json" },
				});
				resolve(res.data);
			} catch (error) {
				reject(error);
			}
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(blob);
	});
}

export async function uploadExerciseMedia(
	uri: string,
	mediaType: "image" | "video",
	exerciseId?: number
): Promise<MediaUploadResult> {
	try {
		if (mediaType === "video") {
			return await uploadVideoDirect(uri, exerciseId);
		}
		return await uploadImageBase64(uri, exerciseId);
	} catch (error) {
		console.error(`Failed to upload ${mediaType}:`, error);
		throw new Error(`Failed to upload ${mediaType}`);
	}
}

export async function uploadExerciseImage (uri: string, exerciseId?: number): Promise<string> {
	const result = await uploadExerciseMedia(uri, 'image', exerciseId);
	return result.url;
}

export async function uploadExerciseVideo (uri: string, exerciseId?: number): Promise<string> {
	const result = await uploadExerciseMedia(uri, 'video', exerciseId);
	return result.url;
}
