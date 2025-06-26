import React, { useMemo, useRef, useState } from "react";
import {
	Drawer,
	DrawerBackdrop,
	DrawerContent,
	DrawerHeader,
	DrawerBody,
	DrawerFooter,
	DrawerCloseButton,
} from "../../app/components/ui/drawer";
import { Button, ButtonGroup, ButtonText } from "../../app/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { ExerciseDifficulty } from "../../store/data/dataSlice";
import { i18n } from "../../i18n";
import { ScrollView, View } from "react-native";
import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { createCustomExercise } from "../../store/data/dataSaga";
import { createExerciseSchemaStep1, createExerciseSchemaStep2 } from "../../schemas/schema";
import CreateExerciseStepTwo from "../excercise-creation/CreateExerciseStep2";
import CreateExerciseStepOne from "../excercise-creation/CreateExerciseStep1";

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
	};
	const [durationSettings, setDurationSettings] = useState(defaultDurationSettings);

	const dispatch: AppDispatch = useDispatch();
	const nameRef = useRef("");
	const descriptionRef = useRef("");
	const instructionsRef = useRef("");
	const focusRef = useRef("");
	const youtubeUrlRef = useRef("");

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
		youtubeUrl?: string;
	} | null>({
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
		youtubeUrl: undefined,
	});

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

	const handleBack = () => setStep((prev) => (prev === Step.DESCRIPTION ? prev : ((prev - 1) as Step)));
	function handleChange(name: keyof typeof formData, value: string) {
		if (name === "focus") {
			focusRef.current = value;
			setFocus(value);
			setFormData((prev) => (prev ? { ...prev, focus: value.split(",") } : prev));
		} else if (name === "name") {
			nameRef.current = value;
			setFormData((prev) => (prev ? { ...prev, name: value } : prev));
		} else if (name === "description") {
			descriptionRef.current = value;
			setFormData((prev) => (prev ? { ...prev, description: value } : prev));
		} else if (name === "instructions") {
			instructionsRef.current = value;
			setFormData((prev) => (prev ? { ...prev, instructions: value } : prev));
		} else if (name === "youtubeUrl") {
			youtubeUrlRef.current = value;
			setFormData((prev) => (prev ? { ...prev, youtubeUrl: value } : prev));
		} else {
			setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
		}
	}

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
		await dispatch(createCustomExercise(formData)).unwrap();
		props.onClose();
		setFormData(null);
	};

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
							<CreateExerciseStepOne formData={formData} formErrors={formErrors} onChange={handleChange} />
						)}

						{step === Step.SETTINGS && (
							<CreateExerciseStepTwo
								formData={formData}
								durationSettings={durationSettings}
								formErrors={formErrors}
								setFormData={setFormData}
								setDurationSettings={setDurationSettings}
								onConfirm={{}}
							/>
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
