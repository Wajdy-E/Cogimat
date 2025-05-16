import React from "react";
import { VStack } from "@/components/ui/vstack";
import { View } from "react-native";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Volume2, Eye, ArrowRight, AlertCircleIcon } from "lucide-react-native";
import AnimatedSwitch from "../AnimatedSwitch";
import CustomSlider from "../CustomSlider";
import ColorPickerModal from "../exercises/ColorPickerModal";
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
	setShowOffScreenColorPicker,
	setShowOnScreenColorPicker,
	showOffScreenColorPicker,
	showOnScreenColorPicker,
	onScreenColor,
	offScreenColor,
	onColorChange,
	onConfirm,
}: any) {
	const updateDuration = (key: keyof typeof durationSettings, value: number) => {
		setDurationSettings((prev: any) => ({ ...prev, [key]: value }));
		setFormData((prev: any) => ({ ...prev, [key]: value }));
	};

	return (
		<VStack space="4xl">
			<Heading size="lg" className="text-primary-500">
				Exercise Parameters
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
					{/* <AnimatedSwitch
						defaultValue={false}
						onChange={() => {}}
						onIcon={<ButtonIcon as={Volume2} size={"xxl" as any} stroke="black" />}
						offIcon={<ButtonIcon as={Eye} size={"xxl" as any} stroke="black" />}
					/> */}
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
				Timing Settings
			</Heading>

			{["offScreenTime", "onScreenTime", "exerciseTime", "restTime"].map((key) => (
				<CustomSlider
					key={key}
					title={`exercise.form.${key}`}
					size="lg"
					minValue={key === "exerciseTime" ? 1 : 0.5}
					maxValue={key === "restTime" ? 90 : key === "exerciseTime" ? 5 : 15}
					step={key === "exerciseTime" ? 0.5 : key === "restTime" ? 1 : 0.1}
					value={durationSettings[key]}
					defaultValue={durationSettings[key]}
					suffix={key === "exerciseTime" ? "general.time.minutes" : "general.time.seconds"}
					onChange={(value) => updateDuration(key, value)}
				/>
			))}

			<Heading size="md" className="text-primary-500">
				{i18n.t("exercise.sections.colorSettings")}
			</Heading>

			<View className="flex-row justify-between">
				<Heading size="sm">{i18n.t("exercise.form.offScreenColor", { offScreenColor })}</Heading>
				<Button variant="link" onPress={() => setShowOffScreenColorPicker(true)}>
					<Icon as={ArrowRight} size="md" />
				</Button>
			</View>

			<View className="flex-row justify-between">
				<Heading size="sm">{i18n.t("exercise.form.onScreenColor", { onScreenColor })}</Heading>
				<Button variant="link" onPress={() => setShowOnScreenColorPicker(true)}>
					<Icon as={ArrowRight} size="md" />
				</Button>
			</View>

			<ColorPickerModal
				isOpen={showOffScreenColorPicker}
				onClose={() => setShowOffScreenColorPicker(false)}
				onConfirm={onConfirm.off}
				onColorChange={onColorChange.off}
			/>

			<ColorPickerModal
				isOpen={showOnScreenColorPicker}
				onClose={() => setShowOnScreenColorPicker(false)}
				onConfirm={onConfirm.on}
				onColorChange={onColorChange.on}
			/>
		</VStack>
	);
}
