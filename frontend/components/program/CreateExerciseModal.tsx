import React, { useState } from "react";
import {
	Modal,
	ModalBackdrop,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
} from "../../app/components/ui/modal";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

interface CreateExerciseModalProps {
	isOpen: boolean;
	onClose: () => void;
}

enum Step {
	NAME = 1,
	DESCRIPTION,
	DIFFICULTY,
}

function CreateExerciseModal(props: CreateExerciseModalProps) {
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

	const handleNext = () =>
		setStep((prev) => (prev === Step.DIFFICULTY ? prev : ((prev + 1) as Step)));
	const handleBack = () =>
		setStep((prev) => (prev === Step.NAME ? prev : ((prev - 1) as Step)));
	const handleChange = (name: keyof typeof formData, value: string) =>
		setFormData({ ...formData, [name]: value });
	const handleSubmit = () => {
		console.log("Exercise Data:", formData);
		props.onClose();
	};

	return (
		<Modal isOpen={props.isOpen} onClose={props.onClose} size="full">
			<ModalBackdrop />
			<SafeAreaProvider>
				<SafeAreaView>
					<ModalContent className="h-full bg-secondary-400 w-screen">
						<ModalHeader>
							<Heading size="md">
								{step === Step.NAME
									? "Exercise Name"
									: step === Step.DESCRIPTION
										? "Description"
										: "Difficulty Level"}
							</Heading>
							<ModalCloseButton onPress={props.onClose}>
								<Icon as={CloseIcon} size="md" />
							</ModalCloseButton>
						</ModalHeader>

						<ModalBody>
							{step === Step.NAME && (
								<Input>
									<InputField
										placeholder="Enter exercise name"
										value={formData.name}
									/>
								</Input>
							)}
							{step === Step.DESCRIPTION && (
								<Input>
									<InputField
										placeholder="Describe the exercise"
										value={formData.description}
									/>
								</Input>
							)}
							{step === Step.DIFFICULTY && (
								<Input>
									<InputField
										placeholder="Difficulty (Easy, Medium, Hard)"
										value={formData.difficulty}
									/>
								</Input>
							)}
						</ModalBody>

						<ModalFooter>
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
						</ModalFooter>
					</ModalContent>
				</SafeAreaView>
			</SafeAreaProvider>
		</Modal>
	);
}

export default CreateExerciseModal;
