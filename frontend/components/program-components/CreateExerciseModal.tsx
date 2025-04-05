import React, { useState } from "react";
import {
	Drawer,
	DrawerBackdrop,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerCloseButton,
} from "../../app/components/ui/drawer";
import { Button, ButtonIcon, ButtonText } from "../../app/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Icon, CloseIcon } from "@/components/ui/icon";
import FormInput from "../FormInput";
import Colors from "./Colors";
import { VStack } from "@/components/ui/vstack";
import FormSelect, { FormSelectOptions } from "../FormSelect";
import { ExerciseDifficulty } from "../../store/data/dataSlice";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { FormControl, FormControlLabel, FormControlLabelText } from "@/components/ui/form-control";
import Shapes from "./Shapes";
import Numbers from "./Numbers";
import Letters from "./Letters";
import { i18n } from "../../i18n";
import { ScrollView, View } from "react-native";
import AnimatedSwitch from "../AnimatedSwitch";
import { Volume2, Eye, ArrowRight } from "lucide-react-native";
import ModalComponent from "../Modal";
import WheelColorPicker from "react-native-wheel-color-picker";
import ColorPickerModal from "../exercises/ColorPickerModal";
import CustomImagePicker from "../ImagePicker";
import CustomVideoPicker from "../CustomVideoPicker";

interface CreateExerciseModalProps {
	isOpen: boolean;
	onClose: () => void;
}

enum Step {
	NAME = 1,
	DESCRIPTION,
	DIFFICULTY,
}

function CreateExerciseDrawer(props: CreateExerciseModalProps) {
	const [step, setStep] = useState<Step>(Step.NAME);
	const [formData, setFormData] = useState<{
		name: string;
		description: string;
		instructions: string;
		difficulty: string;
		shapes: string[];
		letters: string[];
		numbers: number[];
		colors: string[];
		focus?: string[];
		imageUri?: string;
		videoUri?: string;
	}>({
		name: "",
		description: "",
		instructions: "",
		difficulty: "",
		shapes: [],
		letters: [],
		numbers: [],
		colors: [],
		focus: [],
		imageUri: undefined,
		videoUri: undefined,
	});

	const [durationSettings, setDurationSettings] = useState({
		offScreenTime: "0.5",
		onScreenTime: "0.5",
		exerciseTime: "60",
	});

	const options: FormSelectOptions[] = [
		{ label: "exercise.difficulty.beginner", value: ExerciseDifficulty.Beginner },
		{ label: "exercise.difficulty.intermediate", value: ExerciseDifficulty.Intermediate },
		{ label: "exercise.difficulty.advanced", value: ExerciseDifficulty.Advanced },
	];

	const [showOffScreenColorPicker, setShowOffScreenColorPicker] = useState(false);
	const [showOnScreenColorPicker, setShowOnScreenColorPicker] = useState(false);
	const [onScreenColor, setOnScreenColor] = useState("#000000");
	const [offScreenColor, setOffScreenColor] = useState("#FFFFFF");

	const handleOffScreenTimeChange = (value: string) => {
		setDurationSettings((prev) => ({ ...prev, offScreenTime: value }));
	};

	const handleOnScreenTimeChange = (value: string) => {
		setDurationSettings((prev) => ({ ...prev, onScreenTime: value }));
	};

	const handleExerciseTimeChange = (value: string) => {
		setDurationSettings((prev) => ({ ...prev, exerciseTime: value }));
	};

	function onScreenColorConfirm() {}

	function offScreenColorConfirm() {}

	const handleNext = () => setStep((prev) => (prev === Step.DIFFICULTY ? prev : ((prev + 1) as Step)));
	const handleBack = () => setStep((prev) => (prev === Step.NAME ? prev : ((prev - 1) as Step)));
	const handleChange = (name: keyof typeof formData, value: string) => {
		if (name === "focus") {
			setFormData((prev) => ({ ...prev, [name]: value.split(",") }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};
	const handleSubmit = () => {
		console.log("Submitted Data:", formData);
		props.onClose();
	};

	return (
		<Drawer isOpen={props.isOpen} onClose={props.onClose} size="lg" anchor="bottom">
			<DrawerBackdrop />
			<DrawerContent className="bg-background-0 rounded-t-3xl flex-1">
				<DrawerHeader>
					<View className="relative w-full">
						<Heading size="xl" className="text-center">
							{step === Step.NAME
								? i18n.t("createExercise.steps.name")
								: step === Step.DESCRIPTION
									? i18n.t("createExercise.steps.description")
									: i18n.t("createExercise.steps.difficulty")}
						</Heading>
						<View className="absolute right-0 top-0">
							<DrawerCloseButton onPress={props.onClose}>
								<Icon as={CloseIcon} size="md" />
							</DrawerCloseButton>
						</View>
					</View>
				</DrawerHeader>
				<ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
					<DrawerBody>
						{step === Step.NAME && (
							<VStack space="xl">
								<FormInput
									isRequired
									label="createExercise.form.nameLabel"
									placeholder="createExercise.form.namePlaceholder"
									value={formData.name}
									inputSize="md"
									onChange={(text) => handleChange("name", text)}
									inputType="text"
									formSize="lg"
									invalid={false}
								/>
								<FormInput
									placeholder="createExercise.form.descriptionPlaceholder"
									value={formData.description}
									label="createExercise.form.descriptionLabel"
									inputSize="md"
									onChange={(text) => handleChange("description", text)}
									inputType="text"
									formSize="lg"
									invalid={false}
									isRequired
								/>

								<FormControl isRequired={true} size="lg">
									<FormControlLabel>
										<FormControlLabelText>{i18n.t("createExercise.form.instructionsLabel")}</FormControlLabelText>
									</FormControlLabel>
									<Textarea size="lg">
										<TextareaInput
											placeholder={i18n.t("createExercise.form.instructionsPlaceholder")}
											value={formData.instructions}
											onChangeText={(text) => handleChange("instructions", text)}
										/>
									</Textarea>
								</FormControl>

								<FormInput
									placeholder="createExercise.form.focusPlaceholder"
									value={formData.description}
									label="createExercise.form.focusLabel"
									inputSize="md"
									onChange={(text) => handleChange("focus", text)}
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
									onValueChange={(value) => handleChange("difficulty", value)}
									options={options}
									title="createExercise.form.difficultyLabel"
									isRequired={true}
									selectedValue="Beginner"
								/>

								<CustomImagePicker
									buttonText="Upload Thumbnail"
									onImagePicked={(file) => {
										setFormData((prev) => ({ ...prev, imageUri: file.uri }));
									}}
									aspectX={3}
									aspectY={2}
								/>

								<CustomVideoPicker
									onVideoPicked={(file) => setFormData((prev) => ({ ...prev, videoUri: file.uri }))}
									buttonText="Upload video tutorial"
								/>
							</VStack>
						)}

						{step === Step.DESCRIPTION && (
							<VStack space="4xl">
								<Heading size="lg" className="text-primary-500">
									Exercise Parameters
								</Heading>
								<View className="flex-row justify-between items-center">
									<Colors onChange={(selectedColors) => setFormData((prev) => ({ ...prev, colors: selectedColors }))} />
									<AnimatedSwitch
										defaultValue={false}
										onChange={() => {}}
										onIcon={<ButtonIcon as={Volume2} size={"xxl" as any} stroke={"black"} />}
										offIcon={<ButtonIcon as={Eye} size={"xxl" as any} stroke={"black"} />}
									/>
								</View>
								<View className="flex-row justify-between items-center">
									<Shapes onChange={(selectedShapes) => setFormData((prev) => ({ ...prev, shapes: selectedShapes }))} />
									<AnimatedSwitch
										defaultValue={false}
										onChange={() => {}}
										onIcon={<ButtonIcon as={Volume2} size={"xxl" as any} stroke="black" />}
										offIcon={<ButtonIcon as={Eye} size={"xxl" as any} stroke="black" />}
									/>
								</View>

								<View className="flex-row justify-between items-center">
									<Numbers
										onChange={(selectedNumbers) => setFormData((prev) => ({ ...prev, numbers: selectedNumbers }))}
									/>
									<AnimatedSwitch
										defaultValue={false}
										onChange={() => {}}
										onIcon={<ButtonIcon as={Volume2} size={"xxl" as any} stroke="black" />}
										offIcon={<ButtonIcon as={Eye} size={"xxl" as any} stroke="black" />}
									/>
								</View>

								<View className="flex-row justify-between items-center">
									<Letters
										onChange={(selectedLetters) => setFormData((prev) => ({ ...prev, letters: selectedLetters }))}
									/>
									<AnimatedSwitch
										defaultValue={false}
										onChange={() => {}}
										onIcon={<ButtonIcon as={Volume2} size={"xxl" as any} stroke="black" />}
										offIcon={<ButtonIcon as={Eye} size={"xxl" as any} stroke="black" />}
									/>
								</View>

								<Heading size="lg" className="text-primary-500">
									Timing Settings
								</Heading>
								<FormInput
									inputSize="sm"
									formSize="sm"
									inputType="text"
									label="exercise.form.offScreenTime"
									displayAsRow
									onChange={handleOffScreenTimeChange}
									defaultValue={durationSettings.offScreenTime}
									value={durationSettings.offScreenTime}
									suffix="Seconds"
								/>

								<FormInput
									inputSize="sm"
									formSize="sm"
									inputType="text"
									onChange={handleOnScreenTimeChange}
									defaultValue={durationSettings.onScreenTime}
									label="exercise.form.onScreenTime"
									value={durationSettings.onScreenTime}
									displayAsRow
									suffix="Seconds"
								/>

								<FormInput
									inputSize="sm"
									formSize="sm"
									inputType="text"
									label="exercise.form.exerciseTime"
									displayAsRow
									onChange={handleExerciseTimeChange}
									defaultValue={durationSettings.exerciseTime}
									value={durationSettings.exerciseTime}
									suffix="Seconds"
								/>

								<Heading size="md" className="text-primary-500">
									{i18n.t("exercise.sections.colorSettings")}
								</Heading>
								<View className="flex-row justify-between">
									<Heading size="sm">{i18n.t("exercise.form.offScreenColor")}</Heading>
									<Button variant="link" onPress={() => setShowOffScreenColorPicker(true)}>
										<Icon as={ArrowRight} size="md" />
									</Button>
								</View>
								<View className="flex-row justify-between">
									<Heading size="sm">{i18n.t("exercise.form.onScreenColor")}</Heading>
									<Button variant="link" onPress={() => setShowOnScreenColorPicker(true)}>
										<Icon as={ArrowRight} size="md" />
									</Button>
								</View>

								<ColorPickerModal
									isOpen={showOffScreenColorPicker}
									onClose={() => setShowOffScreenColorPicker(false)}
									onConfirm={offScreenColorConfirm}
									onColorChange={(color: string) => setOffScreenColor(color)}
								/>

								<ColorPickerModal
									isOpen={showOnScreenColorPicker}
									onClose={() => setShowOnScreenColorPicker(false)}
									onConfirm={onScreenColorConfirm}
									onColorChange={(color: string) => setOnScreenColor(color)}
								/>
							</VStack>
						)}

						{step === Step.DIFFICULTY && (
							<Input>
								<InputField
									placeholder={i18n.t("createExercise.form.difficultyPlaceholder")}
									value={formData.difficulty}
									onChangeText={(text) => handleChange("difficulty", text)}
								/>
							</Input>
						)}
					</DrawerBody>
				</ScrollView>
				<DrawerFooter className="flex-row justify-end items-center gap-3">
					{step !== Step.NAME && (
						<Button variant="outline" onPress={handleBack}>
							<ButtonText>{i18n.t("general.buttons.previous")}</ButtonText>
						</Button>
					)}
					{step !== Step.DIFFICULTY ? (
						<Button onPress={handleNext}>
							<ButtonText>{i18n.t("general.buttons.next")}</ButtonText>
						</Button>
					) : (
						<Button onPress={handleSubmit}>
							<ButtonText>{i18n.t("general.buttons.submit")}</ButtonText>
						</Button>
					)}
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default CreateExerciseDrawer;
