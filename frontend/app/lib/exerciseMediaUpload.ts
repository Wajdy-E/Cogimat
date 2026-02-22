import axios from "axios";

const BASE_URL = (process.env.BASE_URL ?? "").replace(/\/$/, "");
const BLOB_API_URL = "https://blob.vercel-storage.com";

export interface MediaUploadResult {
	url: string;
	filename: string;
	contentType: string;
	size: number;
}

/**
 * Upload video using Vercel Blob client upload (direct to Blob, bypasses 4.5MB server limit).
 * Implements the token exchange + direct upload manually (no @vercel/blob - it uses Node.js crypto).
 */
async function uploadVideoDirect(uri: string, exerciseId?: number): Promise<MediaUploadResult> {
	const response = await fetch(uri);
	const blob = await response.blob();
	const baseName = uri.split("/").pop() ?? `video.mp4`;
	const pathname = `admin-videos/${Date.now()}-${baseName}`;

	// 1. Get client token from our API
	if (!BASE_URL) {
		throw new Error("BASE_URL is not configured. Cannot upload video.");
	}

	const tokenUrl = `${BASE_URL}/api/blob-client-upload`;
	console.log("[uploadVideoDirect] Requesting token from:", tokenUrl);
	const tokenRes = await fetch(tokenUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			type: "blob.generate-client-token",
			payload: {
				pathname,
				callbackUrl: `${BASE_URL}/api/blob-client-upload`,
				clientPayload: null,
				multipart: false,
			},
		}),
	});

	const tokenBody = await tokenRes.text();
	if (!tokenRes.ok) {
		let errMsg = tokenBody || `HTTP ${tokenRes.status}`;
		try {
			const parsed = JSON.parse(tokenBody);
			if (parsed?.error) errMsg = parsed.error;
		} catch {
			// use errMsg as-is
		}
		throw new Error(`Failed to get upload token: ${errMsg}`);
	}

	let clientToken: string;
	try {
		const parsed = JSON.parse(tokenBody);
		clientToken = parsed?.clientToken;
	} catch {
		throw new Error("Invalid JSON in upload token response");
	}
	if (!clientToken) {
		throw new Error("No client token in response");
	}

	// 2. Upload directly to Vercel Blob (pathname can contain slashes)
	const uploadUrl = `${BLOB_API_URL}/${pathname.split("/").map(encodeURIComponent).join("/")}`;
	const uploadRes = await fetch(uploadUrl, {
		method: "PUT",
		headers: {
			Authorization: `Bearer ${clientToken}`,
			"Content-Type": "video/mp4",
			"x-content-type": "video/mp4",
		},
		body: blob,
	});

	if (!uploadRes.ok) {
		const errText = await uploadRes.text();
		throw new Error(`Upload failed: ${errText}`);
	}

	const result = await uploadRes.json();
	return {
		url: result.url,
		filename: baseName,
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
