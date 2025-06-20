import axios from "axios";

const BASE_URL = process.env.BASE_URL;

export interface MediaUploadResult {
	url: string;
	filename: string;
	contentType: string;
	size: number;
}

export async function uploadExerciseMedia(
	uri: string,
	mediaType: "image" | "video",
	exerciseId?: number
): Promise<MediaUploadResult> {
	try {
		// Convert file to base64
		const response = await fetch(uri);
		const blob = await response.blob();

		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = async () => {
				try {
					const base64Data = reader.result as string;

					const payload = {
						fileData: base64Data,
						mediaType,
						exerciseId: exerciseId?.toString(),
					};

					const response = await axios.post(`${BASE_URL}/api/exercise-media-upload`, payload, {
						headers: {
							"Content-Type": "application/json",
						},
					});

					resolve(response.data);
				} catch (error) {
					reject(error);
				}
			};
			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error(`Failed to upload ${mediaType}:`, error);
		throw new Error(`Failed to upload ${mediaType}`);
	}
}

export async function uploadExerciseImage(uri: string, exerciseId?: number): Promise<string> {
	const result = await uploadExerciseMedia(uri, "image", exerciseId);
	return result.url;
}

export async function uploadExerciseVideo(uri: string, exerciseId?: number): Promise<string> {
	const result = await uploadExerciseMedia(uri, "video", exerciseId);
	return result.url;
}
