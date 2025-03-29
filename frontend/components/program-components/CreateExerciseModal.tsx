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
import { View } from "react-native";
import AnimatedSwitch from "../AnimatedSwitch";
import { Volume2, Eye } from "lucide-react-native";

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
	}>({
		name: "",
		description: "",
		instructions: "",
		difficulty: "",
		shapes: [],
		letters: [],
		numbers: [],
		colors: [],
	});

	const options: FormSelectOptions[] = [
		{ label: "exercise.difficulty.beginner", value: ExerciseDifficulty.Beginner },
		{ label: "exercise.difficulty.intermediate", value: ExerciseDifficulty.Intermediate },
		{ label: "exercise.difficulty.advanced", value: ExerciseDifficulty.Advanced },
	];

	const handleNext = () => setStep((prev) => (prev === Step.DIFFICULTY ? prev : ((prev + 1) as Step)));
	const handleBack = () => setStep((prev) => (prev === Step.NAME ? prev : ((prev - 1) as Step)));
	const handleChange = (name: keyof typeof formData, value: string) =>
		setFormData((prev) => ({ ...prev, [name]: value }));
	const handleSubmit = () => {
		console.log("Submitted Data:", formData);
		props.onClose();
	};

	return (
		<Drawer isOpen={props.isOpen} onClose={props.onClose} size="lg" anchor="bottom">
			<DrawerBackdrop />
			<DrawerContent className="bg-background-0 rounded-t-3xl overflow-hidden">
				<VStack space="lg">
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

								<FormSelect
									size="lg"
									label="createExercise.form.difficultyLabel"
									value={formData.difficulty}
									variant="outline"
									onValueChange={(value) => handleChange("difficulty", value)}
									options={options}
									title="createExercise.form.difficultyLabel"
									isRequired={true}
									selectedValue="beginner"
								/>
							</VStack>
						)}

						{step === Step.DESCRIPTION && (
							<VStack space="4xl">
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

					<DrawerFooter className="flex-row gap-3">
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
				</VStack>
			</DrawerContent>
		</Drawer>
	);
}

export default CreateExerciseDrawer;
