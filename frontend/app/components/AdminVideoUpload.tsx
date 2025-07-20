import React, { useState } from "react";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
	Select,
	SelectTrigger,
	SelectInput,
	SelectPortal,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectItem,
} from "@/components/ui/select";
import {
	FormControl,
	FormControlLabel,
	FormControlLabelText,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
} from "@/components/ui/form-control";
import { AlertCircle, Upload } from "lucide-react-native";
import CustomVideoPicker from "./CustomVideoPicker";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { showLoadingOverlay, hideLoadingOverlay } from "@/store/ui/uiSlice";
import { useAppAlert } from "../hooks/useAppAlert";
import { i18n } from "../i18n";
import { uploadExerciseVideo } from "../lib/exerciseMediaUpload";

interface AdminVideo {
	title: string;
	description: string;
	category: string;
	videoUri: string;
}

interface AdminVideoUploadProps {
	onUploadSuccess?: () => void;
	onClose?: () => void;
}

export default function AdminVideoUpload({ onUploadSuccess, onClose }: AdminVideoUploadProps) {
	const [formData, setFormData] = useState<AdminVideo>({
		title: "",
		description: "",
		category: "general",
		videoUri: "",
	});
	const [errors, setErrors] = useState<Partial<AdminVideo>>({});
	const user = useSelector((state: RootState) => state.user.user.baseInfo);
	const dispatch = useDispatch();
	const { showSuccess, showError } = useAppAlert();

	// Computed validation state to avoid infinite re-renders
	const isFormValid = formData.title.trim() && formData.videoUri;

	const categories = [
		{ label: i18n.t("admin.categories.general"), value: "general" },
		{ label: i18n.t("admin.categories.tutorials"), value: "tutorials" },
		{ label: i18n.t("admin.categories.announcements"), value: "announcements" },
		{ label: i18n.t("admin.categories.exerciseGuides"), value: "exercise-guides" },
		{ label: i18n.t("admin.categories.tipsAndTricks"), value: "tips" },
	];

	const validateForm = (): boolean => {
		const newErrors: Partial<AdminVideo> = {};

		if (!formData.title.trim()) {
			newErrors.title = i18n.t("admin.videoUpload.titleRequired");
		}

		if (!formData.videoUri) {
			newErrors.videoUri = i18n.t("admin.videoUpload.videoRequired");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleUpload = async () => {
		if (!validateForm()) {
			return;
		}
		if (!user?.id) {
			showError(i18n.t("admin.videoUpload.error"), i18n.t("admin.videoUpload.userNotAuthenticated"));
			return;
		}

		try {
			// Show uploading message
			dispatch(showLoadingOverlay(i18n.t("admin.videoUpload.uploading")));

			// Upload video to Vercel Blob
			const videoUrl = await uploadExerciseVideo(formData.videoUri);

			const uploadData = {
				title: formData.title,
				description: formData.description,
				category: formData.category,
				adminId: user.id,
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
				showSuccess(i18n.t("admin.videoUpload.success"), i18n.t("admin.videoUpload.uploaded"));
				setFormData({
					title: "",
					description: "",
					category: "general",
					videoUri: "",
				});
				onUploadSuccess?.();
				onClose?.();
			} else {
				throw new Error(result.error || i18n.t("admin.videoUpload.uploadFailed"));
			}
		} catch (error: any) {
			console.error("Upload failed:", error);
			showError(i18n.t("admin.videoUpload.uploadFailed"), error.message || i18n.t("admin.videoUpload.failedToUpload"));
		} finally {
			dispatch(hideLoadingOverlay());
		}
	};

	const updateFormData = (field: keyof AdminVideo, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	return (
		<Box className="bg-secondary-500 p-5 rounded-md">
			<VStack space="lg">
				<Heading size="lg" className="text-primary-500">
					{i18n.t("admin.videoUpload.title")}
				</Heading>

				<FormControl isInvalid={!!errors.title}>
					<FormControlLabel>
						<FormControlLabelText>{i18n.t("admin.videoUpload.titleLabel")}</FormControlLabelText>
					</FormControlLabel>
					<Input>
						<InputField
							placeholder={i18n.t("admin.videoUpload.titlePlaceholder")}
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
						<FormControlLabelText>{i18n.t("admin.videoUpload.descriptionLabel")}</FormControlLabelText>
					</FormControlLabel>
					<Textarea>
						<TextareaInput
							placeholder={i18n.t("admin.videoUpload.descriptionPlaceholder")}
							value={formData.description}
							onChangeText={(text) => updateFormData("description", text)}
						/>
					</Textarea>
				</FormControl>

				<FormControl>
					<FormControlLabel>
						<FormControlLabelText>{i18n.t("admin.videoUpload.categoryLabel")}</FormControlLabelText>
					</FormControlLabel>
					<Select selectedValue={formData.category} onValueChange={(value) => updateFormData("category", value)}>
						<SelectTrigger>
							<SelectInput placeholder="Select category" />
						</SelectTrigger>
						<SelectPortal>
							<SelectBackdrop />
							<SelectContent>
								<SelectDragIndicatorWrapper>
									<SelectDragIndicator />
								</SelectDragIndicatorWrapper>
								{categories.map((category) => (
									<SelectItem key={category.value} label={category.label} value={category.value} />
								))}
							</SelectContent>
						</SelectPortal>
					</Select>
				</FormControl>

				<FormControl isInvalid={!!errors.videoUri}>
					<FormControlLabel>
						<FormControlLabelText>{i18n.t("admin.videoUpload.videoLabel")}</FormControlLabelText>
					</FormControlLabel>
					<CustomVideoPicker
						onVideoPicked={(file) => updateFormData("videoUri", file.uri)}
						buttonText={i18n.t("admin.videoUpload.selectVideo")}
					/>
					{errors.videoUri && (
						<FormControlError>
							<FormControlErrorIcon as={AlertCircle} />
							<FormControlErrorText>{errors.videoUri}</FormControlErrorText>
						</FormControlError>
					)}
				</FormControl>

				<Button onPress={handleUpload} disabled={!isFormValid} action="primary" className="w-full">
					<>
						<ButtonIcon as={Upload} />
						<ButtonText>{i18n.t("admin.videoUpload.upload")}</ButtonText>
					</>
				</Button>
			</VStack>
		</Box>
	);
}
