import React from "react";
import { VStack } from "@/components/ui/vstack";
import { View } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Volume2, Eye, ArrowRight, AlertCircleIcon } from "lucide-react-native";
import AnimatedSwitch from "../AnimatedSwitch";
import CustomSlider from "../CustomSlider";
import {
	FormControl,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
} from "@/components/ui/form-control";
import { i18n } from "../../i18n";
import Letters from "../program-components/Letters";
import Numbers from "../program-components/Numbers";
import Shapes from "../program-components/Shapes";
import Colors from "../program-components/Colors";

export default function CreateExerciseStepTwo({
	formData,
	durationSettings,
	formErrors,
	setFormData,
	setDurationSettings,
	onConfirm,
}: any) {
	const updateDuration = (key: string, value: number) => {
		setDurationSettings((prev: any) => ({
			...prev,
			[key]: value,
		}));
		setFormData((prev: any) => ({
			...prev,
			[key]: value,
		}));
	};

	return (
		<VStack space="xl" style={{ paddingBottom: 80 }}>
			<Heading size="lg" className="text-primary-500">
				{i18n.t("exerciseCreation.exerciseParameters")}
			</Heading>

			{["colors", "shapes", "numbers", "letters"].map((type, idx) => (
				<View key={type}>
					{type === "colors" && (
						<Colors onChange={(selected) => setFormData((prev: any) => ({ ...prev, colors: selected }))} />
					)}
					{type === "shapes" && (
						<Shapes onChange={(selected) => setFormData((prev: any) => ({ ...prev, shapes: selected }))} />
					)}
					{type === "numbers" && (
						<Numbers onChange={(selected) => setFormData((prev: any) => ({ ...prev, numbers: selected }))} />
					)}
					{type === "letters" && (
						<Letters onChange={(selected) => setFormData((prev: any) => ({ ...prev, letters: selected }))} />
					)}
				</View>
			))}

			{formErrors.condition && (
				<FormControl isInvalid={!!formErrors.condition}>
					<FormControlError>
						<FormControlErrorIcon as={AlertCircleIcon} />
						<FormControlErrorText size="sm">{i18n.t(formErrors.condition)}</FormControlErrorText>
					</FormControlError>
				</FormControl>
			)}

			<Heading size="lg" className="text-primary-500">
				{i18n.t("exerciseCreation.timingSettings")}
			</Heading>

			{["offScreenTime", "onScreenTime", "exerciseTime"].map((key) => (
				<CustomSlider
					key={key}
					title={`exercise.form.${key}`}
					size="lg"
					minValue={key === "exerciseTime" ? 1 : 0.5}
					maxValue={key === "exerciseTime" ? 5 : 15}
					step={key === "exerciseTime" ? 0.5 : 0.1}
					value={durationSettings[key]}
					defaultValue={durationSettings[key]}
					suffix={key === "exerciseTime" ? "general.time.minutes" : "general.time.seconds"}
					onChange={(value) => updateDuration(key, value)}
				/>
			))}
		</VStack>
	);
}
