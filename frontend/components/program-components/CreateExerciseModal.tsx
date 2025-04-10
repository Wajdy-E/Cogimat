import React, { useMemo, useState } from "react";
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
import { Icon, CloseIcon, AlertCircleIcon } from "@/components/ui/icon";
import FormInput from "../FormInput";
import Colors from "./Colors";
import { VStack } from "@/components/ui/vstack";
import FormSelect, { FormSelectOptions } from "../FormSelect";
import { ExerciseDifficulty } from "../../store/data/dataSlice";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import {
	FormControl,
	FormControlError,
	FormControlErrorIcon,
	FormControlErrorText,
	FormControlLabel,
	FormControlLabelText,
} from "@/components/ui/form-control";
import Shapes from "./Shapes";
import Numbers from "./Numbers";
import Letters from "./Letters";
import { i18n } from "../../i18n";
import { ScrollView, View } from "react-native";
import AnimatedSwitch from "../AnimatedSwitch";
import { Volume2, Eye, ArrowRight } from "lucide-react-native";
import ColorPickerModal from "../exercises/ColorPickerModal";
import CustomImagePicker from "../ImagePicker";
import CustomVideoPicker from "../CustomVideoPicker";
import CustomSlider from "../CustomSlider";
import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { createCustomExercise } from "../../store/data/dataSaga";
import { createExerciseSchemaStep1, createExerciseSchemaStep2 } from "../../schemas/schema";

interface CreateExerciseModalProps {
	isOpen: boolean;
	onClose: () => void;
}

enum Step {
	DESCRIPTION = 1,
	SETTINGS = 2,
}

function CreateExerciseDrawer(props: CreateExerciseModalProps) {
	const [step, setStep] = useState<Step>(Step.DESCRIPTION);
	const defaultDurationSettings = {
		offScreenTime: 0.5,
		onScreenTime: 1,
		exerciseTime: 2.5,
		restTime: 30,
	};
	const [durationSettings, setDurationSettings] = useState(defaultDurationSettings);

	const dispatch: AppDispatch = useDispatch();

	const options = useMemo(
		() => [
			{ label: "exercise.difficulty.beginner", value: ExerciseDifficulty.Beginner },
			{ label: "exercise.difficulty.intermediate", value: ExerciseDifficulty.Intermediate },
			{ label: "exercise.difficulty.advanced", value: ExerciseDifficulty.Advanced },
		],
		[]
	);

	const [showOffScreenColorPicker, setShowOffScreenColorPicker] = useState(false);
	const [showOnScreenColorPicker, setShowOnScreenColorPicker] = useState(false);
	const [onScreenColor, setOnScreenColor] = useState("#000000");
	const [offScreenColor, setOffScreenColor] = useState("#ffffff");
	const [focus, setFocus] = useState("");
	const [formErrors, setFormErrors] = useState<Record<string, string>>({});

	const [formData, setFormData] = useState<{
		name: string;
		description: string;
		instructions: string;
		difficulty: ExerciseDifficulty | string;
		shapes: string[];
		letters: string[];
		numbers: number[];
		colors: string[];
		focus?: string[];
		imageUri?: string;
		videoUri?: string;
		offScreenTime: number;
		onScreenTime: number;
		exerciseTime: number;
		offScreenColor: string;
		onScreenColor: string;
		restTime: number;
	}>({
		name: "",
		description: "",
		instructions: "",
		difficulty: ExerciseDifficulty.Beginner,
		shapes: [],
		letters: [],
		numbers: [],
		colors: [],
		focus: [],
		imageUri: undefined,
		videoUri: undefined,
		offScreenTime: durationSettings.offScreenTime,
		onScreenTime: durationSettings.onScreenTime,
		exerciseTime: durationSettings.exerciseTime,
		offScreenColor: offScreenColor,
		onScreenColor: onScreenColor,
		restTime: durationSettings.restTime,
	});

	const updateDuration = (key: keyof typeof durationSettings, value: number) => {
		setDurationSettings((prev) => ({ ...prev, [key]: value }));
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const validateForm = async () => {
		try {
			const schema = step === Step.DESCRIPTION ? createExerciseSchemaStep1 : createExerciseSchemaStep2;
			await schema.validate(formData, { abortEarly: false });
			return true;
		} catch (err: any) {
			const validationErrors = err.inner.reduce((acc: any, curr: any) => {
				acc[curr.path] = curr.message;
				return acc;
			}, {});
			setFormErrors(validationErrors);
			console.log("Validation Errors:", validationErrors);
			return false;
		}
	};

	function onScreenColorConfirm() {
		setFormData((prev) => ({ ...prev, onScreenColor }));
		setShowOnScreenColorPicker(false);
	}

	function offScreenColorConfirm() {
		setFormData((prev) => ({ ...prev, offScreenColor }));
		setShowOffScreenColorPicker(false);
	}

	const handleBack = () => setStep((prev) => (prev === Step.DESCRIPTION ? prev : ((prev - 1) as Step)));
	const handleChange = async (name: keyof typeof formData, value: any) => {
		if (name === "focus") {
			setFocus(value);
			setFormData((prev) => ({ ...prev, [name]: value.split(",") }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}

		try {
			const schema = step === Step.DESCRIPTION ? createExerciseSchemaStep1 : createExerciseSchemaStep2;
			await schema.validateAt(name, { ...formData, [name]: value });
			setFormErrors((prev) => {
				const updated = { ...prev };
				delete updated[name];
				return updated;
			});
		} catch (err: any) {
			setFormErrors((prev) => ({ ...prev, [name]: err.message }));
		}
	};

	const handleNext = async () => {
		if (step === Step.DESCRIPTION) {
			const valid = await validateForm();

			if (!valid) return;
		}
		setStep((prev) => (prev === Step.SETTINGS ? prev : ((prev + 1) as Step)));
	};

	const handleSubmit = async () => {
		const valid = await validateForm();
		if (!valid) return;
		console.log(formData);
		await dispatch(createCustomExercise(formData)).unwrap();
		props.onClose();
	};

	const clearFormError = (field: string) =>
		setFormErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[field];
			return newErrors;
		});

	const renderFooterButton = () => {
		if (step === Step.SETTINGS) {
			return (
				<Button onPress={handleSubmit}>
					<ButtonText>{i18n.t("general.buttons.submit")}</ButtonText>
				</Button>
			);
		}
		return (
			<Button onPress={handleNext}>
				<ButtonText>{i18n.t("general.buttons.next")}</ButtonText>
			</Button>
		);
	};
	0;
	return (
		<Drawer isOpen={props.isOpen} onClose={props.onClose} size="lg" anchor="bottom">
			<DrawerBackdrop />
			<DrawerContent className="bg-background-0 rounded-t-3xl flex-1">
				<DrawerHeader>
					<View className="relative w-full">
						<Heading size="xl" className="text-center">
							{step === Step.DESCRIPTION
								? i18n.t("createExercise.steps.description")
								: i18n.t("createExercise.steps.settings")}
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
						{step === Step.DESCRIPTION && (
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
									invalid={!!formErrors.name}
									formErrorKey={formErrors.name}
								/>
								<FormInput
									placeholder="createExercise.form.descriptionPlaceholder"
									value={formData.description}
									label="createExercise.form.descriptionLabel"
									inputSize="md"
									onChange={(text) => handleChange("description", text)}
									inputType="text"
									formSize="lg"
									isRequired
									invalid={!!formErrors.description}
									formErrorKey={formErrors.description}
								/>

								<FormControl isRequired={true} size="lg" isInvalid={!!formErrors.instructions}>
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
									<FormControlError>
										<FormControlErrorIcon as={AlertCircleIcon} />
										<FormControlErrorText size="sm">{i18n.t(formErrors.instructions)}</FormControlErrorText>
									</FormControlError>
								</FormControl>

								<FormInput
									placeholder="createExercise.form.focusPlaceholder"
									value={focus}
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
									selectedValue={formData.difficulty}
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

						{step === Step.SETTINGS && (
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
								<CustomSlider
									minValue={0.5}
									defaultValue={durationSettings.offScreenTime}
									maxValue={15}
									size="lg"
									title="exercise.form.offScreenTime"
									suffix="general.time.seconds"
									step={0.1}
									onChange={(value) => updateDuration("offScreenTime", value)}
									value={durationSettings.offScreenTime}
								/>

								<CustomSlider
									minValue={0.5}
									defaultValue={durationSettings.onScreenTime}
									maxValue={15}
									size="lg"
									title="exercise.form.onScreenTime"
									suffix="general.time.seconds"
									step={0.1}
									onChange={(value) => updateDuration("onScreenTime", value)}
									value={durationSettings.onScreenTime}
								/>

								<CustomSlider
									minValue={1}
									defaultValue={durationSettings.exerciseTime}
									maxValue={5}
									size="lg"
									title="exercise.form.exerciseTime"
									suffix="general.time.minutes"
									step={0.5}
									onChange={(value) => updateDuration("exerciseTime", value)}
									value={durationSettings.exerciseTime}
								/>
								<CustomSlider
									minValue={1}
									defaultValue={durationSettings.onScreenTime}
									maxValue={90}
									size="lg"
									title="createExercise.form.restTime"
									step={1}
									onChange={(value) => updateDuration("restTime", value)}
									suffix="general.time.seconds"
									value={durationSettings.restTime}
								/>

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
					</DrawerBody>
				</ScrollView>
				<DrawerFooter className="flex-row justify-end items-center gap-3">
					{step !== Step.DESCRIPTION && (
						<Button variant="outline" onPress={handleBack}>
							<ButtonText>{i18n.t("general.buttons.previous")}</ButtonText>
						</Button>
					)}
					{renderFooterButton()}
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default CreateExerciseDrawer;
