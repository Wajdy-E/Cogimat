import React, { useState } from "react";
import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
	FormControl,
	FormControlLabel,
	FormControlLabelText,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
} from "@/components/ui/form-control";
import { Upload, X, AlertCircle } from "lucide-react-native";
import CustomVideoPicker from "./CustomVideoPicker";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { showLoadingOverlay, hideLoadingOverlay } from "../store/ui/uiSlice";
import { useAppAlert } from "../hooks/useAppAlert";
import { i18n } from "../i18n";
import { HStack } from "@/components/ui/hstack";
import { uploadExerciseVideo } from "../lib/exerciseMediaUpload";

interface ExerciseVideo {
	title: string;
	description: string;
	videoUri: string;
}

interface ExerciseVideoUploadProps {
	exerciseId: number;
	exerciseName: string;
	onUploadSuccess?: () => void;
	onClose?: () => void;
}

export default function ExerciseVideoUpload({
	exerciseId,
	exerciseName,
	onUploadSuccess,
	onClose,
}: ExerciseVideoUploadProps) {
	const [formData, setFormData] = useState<ExerciseVideo>({
		title: "",
		description: "",
		videoUri: "",
	});
	const [errors, setErrors] = useState<Partial<ExerciseVideo>>({});
	const user = useSelector((state: RootState) => state.user.user.baseInfo);
	const dispatch = useDispatch();
	const { showSuccess, showError } = useAppAlert();

	// Computed validation state to avoid infinite re-renders
	const isFormValid = formData.title.trim() && formData.videoUri;

	const validateForm = (): boolean => {
		const newErrors: Partial<ExerciseVideo> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (!formData.videoUri) {
			newErrors.videoUri = "Video is required";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleUpload = async () => {
		if (!validateForm()) {
			return;
		}
		if (!user?.id) {
			showError("Error", "User not authenticated");
			return;
		}

		try {
			// Show uploading message
			dispatch(showLoadingOverlay("Uploading video..."));

			// Upload video to Vercel Blob
			const videoUrl = await uploadExerciseVideo(formData.videoUri, exerciseId);

			// Store video metadata in admin_videos table
			const uploadData = {
				title: formData.title,
				description: formData.description,
				category: "exercise-tutorial",
				adminId: user.id,
				exerciseId: exerciseId.toString(),
				videoData: videoUrl, // Now this is the blob URL
				fileName: formData.videoUri.split("/").pop() || "video.mp4",
			};

			const response = await fetch(`${process.env.BASE_URL}/api/admin/video-upload`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(uploadData),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();

			if (result.success) {
				showSuccess("Success", "Video uploaded successfully!");
				setFormData({
					title: "",
					description: "",
					videoUri: "",
				});
				onUploadSuccess?.();
				onClose?.();
			} else {
				throw new Error(result.error || "Upload failed");
			}
		} catch (error: any) {
			console.error("Upload failed:", error);
			showError("Upload Failed", error.message || "Failed to upload video");
		} finally {
			dispatch(hideLoadingOverlay());
		}
	};

	const updateFormData = (field: keyof ExerciseVideo, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	return (
		<Box className="bg-secondary-500 p-5 rounded-md">
			<VStack space="lg">
				<View className="flex-row justify-between items-center">
					<Heading size="lg" className="text-primary-500">
						{i18n.t("exercise.videoUpload.title")}
					</Heading>
					{onClose && (
						<Button variant="link" onPress={onClose}>
							<ButtonIcon as={X} />
						</Button>
					)}
				</View>

				<Text className="text-typography-600">{i18n.t("exercise.videoUpload.subtitle", { exerciseName })}</Text>

				<FormControl isInvalid={!!errors.title}>
					<FormControlLabel>
						<FormControlLabelText>{i18n.t("exercise.videoUpload.titleLabel")}</FormControlLabelText>
					</FormControlLabel>
					<Input>
						<InputField
							placeholder={i18n.t("exercise.videoUpload.titlePlaceholder")}
							value={formData.title}
							onChangeText={(text) => updateFormData("title", text)}
						/>
					</Input>
					{errors.title && (
						<FormControlError>
							<FormControlErrorIcon as={AlertCircle} />
							<FormControlErrorText>{errors.title}</FormControlErrorText>
						</FormControlError>
					)}
				</FormControl>

				<FormControl>
					<FormControlLabel>
						<FormControlLabelText>{i18n.t("exercise.videoUpload.descriptionLabel")}</FormControlLabelText>
					</FormControlLabel>
					<Textarea>
						<TextareaInput
							placeholder={i18n.t("exercise.videoUpload.descriptionPlaceholder")}
							value={formData.description}
							onChangeText={(text) => updateFormData("description", text)}
						/>
					</Textarea>
				</FormControl>

				<FormControl isInvalid={!!errors.videoUri}>
					<FormControlLabel>
						<FormControlLabelText>{i18n.t("exercise.videoUpload.videoLabel")}</FormControlLabelText>
					</FormControlLabel>
					<CustomVideoPicker
						onVideoPicked={(file) => updateFormData("videoUri", file.uri)}
						buttonText={i18n.t("exercise.videoUpload.selectVideo")}
					/>
					{errors.videoUri && (
						<FormControlError>
							<FormControlErrorIcon as={AlertCircle} />
							<FormControlErrorText>{errors.videoUri}</FormControlErrorText>
						</FormControlError>
					)}
				</FormControl>

				<Button onPress={handleUpload} disabled={!isFormValid} action="primary" className="w-full" variant="solid">
					<HStack space="sm">
						<ButtonIcon as={Upload} />
						<ButtonText>{i18n.t("exercise.videoUpload.upload")}</ButtonText>
					</HStack>
				</Button>
			</VStack>
		</Box>
	);
}
