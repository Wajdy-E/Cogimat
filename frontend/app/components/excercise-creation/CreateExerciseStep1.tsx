import React from "react";
import { VStack } from "@/components/ui/vstack";
import FormInput from "../FormInput";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
	FormControl,
	FormControlLabel,
	FormControlLabelText,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
} from "@/components/ui/form-control";
import { AlertCircleIcon } from "lucide-react-native";
import FormSelect from "../FormSelect";
import CustomImagePicker from "../ImagePicker";
import CustomVideoPicker from "../CustomVideoPicker";
import { i18n } from "../../i18n";
import { ExerciseDifficulty } from "@/store/data/dataSlice";

export default function CreateExerciseStepOne({ formData, formErrors, onChange, focus }: any) {
	const options = [
		{ label: "exercise.difficulty.beginner", value: ExerciseDifficulty.Beginner },
		{ label: "exercise.difficulty.intermediate", value: ExerciseDifficulty.Intermediate },
		{ label: "exercise.difficulty.advanced", value: ExerciseDifficulty.Advanced },
	];

	return (
		<VStack space="xl">
			<FormInput
				isRequired
				label="createExercise.form.nameLabel"
				placeholder="createExercise.form.namePlaceholder"
				defaultValue={formData.name}
				inputSize="md"
				onChange={(text) => onChange("name", text)}
				inputType="text"
				formSize="lg"
				invalid={!!formErrors.name}
				formErrorKey={formErrors.name}
			/>

			<FormControl isRequired={true} size="lg" isInvalid={!!formErrors.instructions}>
				<FormControlLabel>
					<FormControlLabelText>{i18n.t("createExercise.form.instructionsLabel")}</FormControlLabelText>
				</FormControlLabel>
				<Textarea size="lg">
					<TextareaInput
						placeholder={i18n.t("createExercise.form.instructionsPlaceholder")}
						defaultValue={formData.instructions}
						onChangeText={(text) => onChange("instructions", text)}
					/>
				</Textarea>
				<FormControlError>
					<FormControlErrorIcon as={AlertCircleIcon} />
					<FormControlErrorText size="sm">{i18n.t(formErrors.instructions)}</FormControlErrorText>
				</FormControlError>
			</FormControl>

			<FormInput
				placeholder="createExercise.form.focusPlaceholder"
				defaultValue={focus}
				label="createExercise.form.focusLabel"
				inputSize="md"
				onChange={(text) => onChange("focus", text)}
				inputType="text"
				formSize="lg"
				invalid={false}
				formHelperKey="createExercise.form.focusHelper"
			/>

			<FormSelect
				size="lg"
				label="createExercise.form.difficultyLabel"
				value={formData.difficulty}
				variant="outline"
				onValueChange={(value) => onChange("difficulty", value)}
				options={options}
				title="createExercise.form.difficultyLabel"
				isRequired={true}
				selectedValue={formData.difficulty}
			/>

			<FormInput
				placeholder="createExercise.form.ytUrlPlaceholder"
				value={formData.youtubeUrl}
				label="createExercise.form.ytUrl"
				inputSize="md"
				onChange={(text) => onChange("youtubeUrl", text)}
				inputType="text"
				formSize="lg"
				formHelperKey={"createExercise.form.ytUrlHelper"}
			/>

			<CustomImagePicker
				buttonText={i18n.t("createExercise.form.uploadThumbnail")}
				onImagePicked={(file) => onChange("imageUri", file.uri)}
				aspectX={3}
				aspectY={2}
			/>

			<CustomVideoPicker
				onVideoPicked={(file) => onChange("videoUri", file.uri)}
				buttonText={i18n.t("createExercise.form.uploadVideoTutorial")}
			/>
		</VStack>
	);
}
