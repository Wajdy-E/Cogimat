import React, { useState } from "react";
import { View, Pressable } from "react-native";
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
import { Upload, X, AlertCircle, Check } from "lucide-react-native";
import CustomVideoPicker from "./CustomVideoPicker";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { showLoadingOverlay, hideLoadingOverlay } from "@/store/ui/uiSlice";
import { useAppAlert } from "../hooks/useAppAlert";
import { i18n } from "../i18n";
import { HStack } from "@/components/ui/hstack";
import { uploadExerciseVideo } from "../lib/exerciseMediaUpload";
import { Checkbox, CheckboxIndicator, CheckboxLabel, CheckboxIcon } from "@/components/ui/checkbox";

interface ExerciseVideo {
	title: string;
	description: string;
	videoUri: string;
	youtubeUrl: string;
	premiumOnly: boolean;
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
		youtubeUrl: "",
		premiumOnly: false,
	});
	const [sourceType, setSourceType] = useState<"file" | "youtube">("file");
	const [errors, setErrors] = useState<Partial<ExerciseVideo>>({});
	const user = useSelector((state: RootState) => state.user.user.baseInfo);
	const dispatch = useDispatch();
	const { showSuccess, showError } = useAppAlert();

	// Valid: title + either file or YouTube URL
	const isFormValid =
		formData.title.trim() && (sourceType === "file" ? !!formData.videoUri : !!formData.youtubeUrl.trim());

	const validateForm = (): boolean => {
		const newErrors: Partial<ExerciseVideo> = {};

		if (!formData.title.trim()) {
			newErrors.title = "Title is required";
		}

		if (sourceType === "file") {
			if (!formData.videoUri) newErrors.videoUri = "Video is required";
		} else {
			if (!formData.youtubeUrl.trim()) newErrors.youtubeUrl = "YouTube URL is required";
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
			dispatch(showLoadingOverlay(sourceType === "youtube" ? "Adding YouTube video..." : "Uploading video..."));

			if (sourceType === "youtube") {
				const uploadData = {
					title: formData.title,
					description: formData.description,
					category: "exercise-tutorial",
					adminId: user.id,
					exerciseId: exerciseId.toString(),
					youtubeUrl: formData.youtubeUrl.trim(),
					premiumOnly: formData.premiumOnly,
				};

				const response = await fetch(`${process.env.BASE_URL}/api/admin/video-upload`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(uploadData),
				});

				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				const result = await response.json();
				if (!result.success) throw new Error(result.error || "Upload failed");

				showSuccess("Success", "YouTube video added successfully!");
			} else {
				const videoUrl = await uploadExerciseVideo(formData.videoUri, exerciseId);
				const uploadData = {
					title: formData.title,
					description: formData.description,
					category: "exercise-tutorial",
					adminId: user.id,
					exerciseId: exerciseId.toString(),
					videoData: videoUrl,
					fileName: formData.videoUri.split("/").pop() || "video.mp4",
					premiumOnly: formData.premiumOnly,
				};

				const response = await fetch(`${process.env.BASE_URL}/api/admin/video-upload`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(uploadData),
				});

				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
				const result = await response.json();
				if (!result.success) throw new Error(result.error || "Upload failed");
				showSuccess("Success", "Video uploaded successfully!");
			}

			setFormData({
				title: "",
				description: "",
				videoUri: "",
				youtubeUrl: "",
				premiumOnly: false,
			});
			onUploadSuccess?.();
			onClose?.();
		} catch (error: any) {
			console.error("Upload failed:", error);
			showError("Upload Failed", error.message || "Failed to upload video");
		} finally {
			dispatch(hideLoadingOverlay());
		}
	};

	const updateFormData = (field: keyof ExerciseVideo, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field as keyof Partial<ExerciseVideo>]) {
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

				<FormControl>
					<FormControlLabel>
						<FormControlLabelText>{i18n.t("exercise.videoUpload.sourceLabel")}</FormControlLabelText>
					</FormControlLabel>
					<View className="flex-row gap-2 mt-1">
						<Pressable
							onPress={() => setSourceType("file")}
							className={`flex-1 p-2 rounded-lg border-2 ${
								sourceType === "file" ? "bg-primary-500 border-primary-500" : "bg-transparent border-outline-300"
							}`}
						>
							<Text
								className={`text-center text-base font-medium ${
									sourceType === "file" ? "text-white" : "text-typography-600"
								}`}
							>
								{i18n.t("exercise.videoUpload.sourceOptionFile")}
							</Text>
						</Pressable>
						<Pressable
							onPress={() => setSourceType("youtube")}
							className={`flex-1 p-2 rounded-lg border-2 ${
								sourceType === "youtube" ? "bg-primary-500 border-primary-500" : "bg-transparent border-outline-300"
							}`}
						>
							<Text
								className={`text-center text-base font-medium ${
									sourceType === "youtube" ? "text-white" : "text-typography-600"
								}`}
							>
								{i18n.t("exercise.videoUpload.sourceOptionYoutube")}
							</Text>
						</Pressable>
					</View>
				</FormControl>

				{sourceType === "file" && (
					<FormControl isInvalid={!!errors.videoUri}>
						<FormControlLabel>
							<FormControlLabelText>{i18n.t("exercise.videoUpload.videoLabel")}</FormControlLabelText>
						</FormControlLabel>
						<CustomVideoPicker
							value={formData.videoUri}
							onVideoPicked={(file) => updateFormData("videoUri", file.uri)}
							onVideoRemoved={() => updateFormData("videoUri", "")}
							buttonText={i18n.t("exercise.videoUpload.selectVideo")}
						/>
						{errors.videoUri && (
							<FormControlError>
								<FormControlErrorIcon as={AlertCircle} />
								<FormControlErrorText>{errors.videoUri}</FormControlErrorText>
							</FormControlError>
						)}
					</FormControl>
				)}

				{sourceType === "youtube" && (
					<FormControl isInvalid={!!errors.youtubeUrl}>
						<FormControlLabel>
							<FormControlLabelText>{i18n.t("exercise.videoUpload.youtubeUrlLabel")}</FormControlLabelText>
						</FormControlLabel>
						<Input>
							<InputField
								placeholder={i18n.t("exercise.videoUpload.youtubeUrlPlaceholder")}
								value={formData.youtubeUrl}
								onChangeText={(text) => updateFormData("youtubeUrl", text)}
								keyboardType="url"
								autoCapitalize="none"
							/>
						</Input>
						{errors.youtubeUrl && (
							<FormControlError>
								<FormControlErrorIcon as={AlertCircle} />
								<FormControlErrorText>{errors.youtubeUrl}</FormControlErrorText>
							</FormControlError>
						)}
					</FormControl>
				)}

				<FormControl>
					<Checkbox
						value="premiumOnly"
						isChecked={formData.premiumOnly}
						onChange={(checked) => updateFormData("premiumOnly", checked)}
						className="flex-row items-center gap-2"
					>
						<CheckboxIndicator>
							<CheckboxIcon as={Check} />
						</CheckboxIndicator>
						<CheckboxLabel className="text-typography-700">
							{i18n.t("exercise.videoUpload.premiumOnlyLabel")}
						</CheckboxLabel>
					</Checkbox>
					<Text size="sm" className="text-typography-500 mt-1">
						{i18n.t("exercise.videoUpload.premiumOnlyDescription")}
					</Text>
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
