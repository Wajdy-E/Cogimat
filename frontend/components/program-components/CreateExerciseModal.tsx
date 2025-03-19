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
import { Button, ButtonText } from "../../app/components/ui/button";
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
import { Divider } from "@/components/ui/divider";
import Shapes from "./Shapes";
import { Box } from "@/components/ui/box";
import Numbers from "./Numbers";
import Letters from "./Letters";

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
		difficulty: string;
	}>({
		name: "",
		description: "",
		difficulty: "",
	});

	const options: FormSelectOptions[] = [
		{ label: ExerciseDifficulty.Beginner, value: ExerciseDifficulty.Beginner },
		{ label: ExerciseDifficulty.Intermediate, value: ExerciseDifficulty.Intermediate },
		{ label: ExerciseDifficulty.Advanced, value: ExerciseDifficulty.Advanced },
	];
	const handleNext = () => setStep((prev) => (prev === Step.DIFFICULTY ? prev : ((prev + 1) as Step)));
	const handleBack = () => setStep((prev) => (prev === Step.NAME ? prev : ((prev - 1) as Step)));
	const handleChange = (name: keyof typeof formData, value: string) => setFormData({ ...formData, [name]: value });
	const handleSubmit = () => {
		props.onClose();
	};

	return (
		<Drawer isOpen={props.isOpen} onClose={props.onClose} size="lg" anchor="bottom">
			<DrawerBackdrop />
			<DrawerContent className="bg-secondary-400 rounded-t-3xl overflow-hidden">
				<DrawerHeader>
					<Heading size="lg">
						{step === Step.NAME ? "Exercise details" : step === Step.DESCRIPTION ? "Description" : "Difficulty Level"}
					</Heading>
					<DrawerCloseButton onPress={props.onClose}>
						<Icon as={CloseIcon} size="md" />
					</DrawerCloseButton>
				</DrawerHeader>
				<Divider />

				<DrawerBody>
					{step === Step.NAME && (
						<VStack space="xl">
							<FormInput
								placeholder="Enter exercise name"
								isRequired
								value={formData.name}
								label="Exercise Name"
								inputSize="md"
								onChange={(text) => handleChange("name", text)}
								inputType="text"
								formSize="lg"
								invalid={false}
							/>
							<FormInput
								placeholder="Enter description"
								value={formData.name}
								label="Description"
								inputSize="md"
								onChange={(text) => handleChange("name", text)}
								inputType="text"
								formSize="lg"
								invalid={false}
							/>

							<FormControl>
								<FormControlLabel>
									<FormControlLabelText>Instructions</FormControlLabelText>
								</FormControlLabel>
								<Textarea size="lg">
									<TextareaInput placeholder="Your text goes here..." />
								</Textarea>
							</FormControl>

							<FormSelect
								size="md"
								label="Difficulty"
								value={ExerciseDifficulty.Beginner}
								variant="outline"
								onValueChange={() => {}}
								options={options}
								title="Difficulty"
							/>
						</VStack>
					)}
					{step === Step.DESCRIPTION && (
						<Box>
							<VStack space="4xl">
								<Colors />
								<Shapes />
								<Numbers />
								<Letters />
							</VStack>
						</Box>
					)}
					{step === Step.DIFFICULTY && (
						<Input>
							<InputField placeholder="Difficulty (Easy, Medium, Hard)" value={formData.difficulty} />
						</Input>
					)}
				</DrawerBody>

				<DrawerFooter>
					{step !== Step.NAME && (
						<Button variant="outline" onPress={handleBack}>
							<ButtonText>Back</ButtonText>
						</Button>
					)}
					{step !== Step.DIFFICULTY ? (
						<Button onPress={handleNext}>
							<ButtonText>Next</ButtonText>
						</Button>
					) : (
						<Button onPress={handleSubmit}>
							<ButtonText>Submit</ButtonText>
						</Button>
					)}
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

export default CreateExerciseDrawer;
