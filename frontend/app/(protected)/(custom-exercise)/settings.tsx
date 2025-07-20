import { View, SafeAreaView, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { CustomExercise, Exercise, CustomizableExerciseOptions } from "../../store/data/dataSlice";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowLeft, Trash2, Edit } from "lucide-react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import AnimatedSwitch from "@/components/AnimatedSwitch";
import { Icon } from "@/components/ui/icon";
import { Eye, EyeOff } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
	updateCustomExerciseThunk,
	submitExercise,
	unsubmitExercise,
	deleteCustomExercise,
} from "../../store/data/dataSaga";
import AlertModal from "@/components/AlertModal";
import { i18n } from "../../i18n";
import { customExerciseToExercise } from "@/lib/helpers/helpers";
import React from "react";
import CustomSlider from "@/components/CustomSlider";

export default function CustomExerciseSettings() {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user.user, shallowEqual);
	const router = useRouter();
	const { themeTextColor } = useTheme();

	// Safely handle the id parameter
	let exerciseId: number | null = null;
	try {
		if (id && typeof id === "string") {
			exerciseId = parseInt(id);
		}
	} catch (error) {
		console.error("Error parsing exercise id:", error);
	}

	const exerciseData = useCustomExercise(exerciseId);
	// Handle the case where useCustomExercise returns an array, null, or undefined
	let exercises: CustomExercise | null = null;
	try {
		if (exerciseData && !Array.isArray(exerciseData) && exerciseData !== null) {
			exercises = exerciseData as CustomExercise;
		}
	} catch (error) {
		console.error("Error processing exercise data:", error);
	}

	const [showSubmitToCogiproAlertModal, setShowSubmitToCogiproAlertModal] = useState(false);
	const [showUnsubmitFromCogiproAlertModal, setShowUnsubmitFromCogiproAlertModal] = useState(false);
	const [showDeleteExerciseAlertModal, setShowDeleteExerciseAlertModal] = useState(false);
	const [showMakePublicAlertModal, setShowMakePublicAlertModal] = useState(false);
	const [showSubmitToCogiproPremiumAlertModal, setShowSubmitToCogiproPremiumAlertModal] = useState(false);
	const [showUnsubmitFromCogiproPremiumAlertModal, setShowUnsubmitFromCogiproPremiumAlertModal] = useState(false);

	// Switch states to track actual values
	const [cogiproSwitchValue, setCogiproSwitchValue] = useState(false);
	const [cogiproPremiumSwitchValue, setCogiproPremiumSwitchValue] = useState(false);

	// Customization settings state

	const [isEditing, setIsEditing] = useState(false);
	const [durationSettings, setDurationSettings] = useState<CustomizableExerciseOptions | undefined>(
		exercises?.customizableOptions
	);

	// Update state when exercises data becomes available
	useEffect(() => {
		if (exercises?.customizableOptions) {
			setDurationSettings(exercises.customizableOptions);
		}
		// Initialize switches based on the submittedToCogipro field
		if (exercises) {
			setCogiproSwitchValue(exercises.submittedToCogipro);
			setCogiproPremiumSwitchValue(exercises.isPremium || false);
		}
	}, [exercises]);

	const handleSliderChange = (key: string, newValue: number) => {
		setDurationSettings((prev) =>
			prev
				? {
						...prev,
						[key]: key === "exerciseTime" ? (newValue * 60).toString() : newValue.toString(),
					}
				: undefined
		);
	};

	function submitToCogipro() {
		if (!exercises) {
			return;
		}

		const convertedExercise: Exercise = customExerciseToExercise(exercises, false);
		dispatch(submitExercise({ exercise: convertedExercise }));
		dispatch(updateCustomExerciseThunk({ ...exercises, submittedToCogipro: true }));
		setCogiproSwitchValue(true);
		setShowSubmitToCogiproAlertModal(false);
	}

	function submitToCogiproPremium() {
		if (!exercises) {
			return;
		}

		const convertedExercise: Exercise = customExerciseToExercise(exercises, true);
		dispatch(submitExercise({ exercise: convertedExercise }));
		dispatch(updateCustomExerciseThunk({ ...exercises, submittedToCogipro: true, isPremium: true }));
		setCogiproPremiumSwitchValue(true);
		setShowSubmitToCogiproPremiumAlertModal(false);
	}

	function unsubmitFromCogipro() {
		if (!exercises) {
			return;
		}

		dispatch(unsubmitExercise({ uniqueIdentifier: exercises.uniqueIdentifier, action: "remove" }));
		dispatch(updateCustomExerciseThunk({ ...exercises, submittedToCogipro: false }));
		setCogiproSwitchValue(false);
		setShowUnsubmitFromCogiproAlertModal(false);
	}

	function unsubmitFromCogiproPremium() {
		if (!exercises) {
			return;
		}

		dispatch(unsubmitExercise({ uniqueIdentifier: exercises.uniqueIdentifier, action: "unpremium" }));
		dispatch(updateCustomExerciseThunk({ ...exercises, isPremium: false }));
		setCogiproPremiumSwitchValue(false);
		setShowUnsubmitFromCogiproPremiumAlertModal(false);
	}

	function handleCogiproToggle(value: boolean) {
		if (!exercises) {
			return;
		}

		if (value && !cogiproSwitchValue) {
			// Turning on - show submit alert
			setShowSubmitToCogiproAlertModal(true);
		} else if (!value && cogiproSwitchValue) {
			// Turning off - show unsubmit alert
			setShowUnsubmitFromCogiproAlertModal(true);
		}
	}

	function handleCogiproPremiumToggle(value: boolean) {
		if (!exercises) {
			return;
		}

		if (value && !cogiproPremiumSwitchValue) {
			// Turning on - show submit alert
			setShowSubmitToCogiproPremiumAlertModal(true);
		} else if (!value && cogiproPremiumSwitchValue) {
			// Turning off - show unsubmit alert
			setShowUnsubmitFromCogiproPremiumAlertModal(true);
		}
	}

	function handleDeleteExercise() {
		if (!exercises) {
			return;
		}

		dispatch(deleteCustomExercise(exercises.id));
		setShowDeleteExerciseAlertModal(false);
		router.back();
	}

	const handlePublicAccessChange = (value: boolean) => {
		if (!exercises) {
			return;
		}

		if (exercises.publicAccess === false) {
			dispatch(updateCustomExerciseThunk({ ...exercises, publicAccess: value, isFavourited: false }));
			setShowMakePublicAlertModal(true);
		} else {
			dispatch(updateCustomExerciseThunk({ ...exercises, publicAccess: value }));
			setShowMakePublicAlertModal(false);
		}
	};

	function onEditCancel() {
		if (!exercises) {
			return;
		}

		setDurationSettings({ ...exercises.customizableOptions });
		setIsEditing(false);
	}

	function onEditSave() {
		if (!exercises) {
			return;
		}

		const updatedExercise = {
			...exercises,
			customizableOptions: {
				...exercises.customizableOptions,
				...durationSettings,
			},
		};
		dispatch(updateCustomExerciseThunk(updatedExercise));
		setIsEditing(false);
	}

	// Early return if exercise data is not yet available
	if (!exercises) {
		return (
			<View className="bg-background-800 h-screen">
				<SafeAreaView className="bg-background-800">
					<View className="flex-row items-center w-full justify-center py-3">
						<View className="flex-row items-center justify-between gap-3 w-[90%]">
							<View className="flex-row items-center gap-3">
								<Button variant="link" onPress={() => router.push(`/(custom-exercise)/${id}`)}>
									<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
								</Button>
								<Heading className="text-typography-950" size="2xl">
									{i18n.t("exercise.page.settings")}
								</Heading>
							</View>
						</View>
					</View>
				</SafeAreaView>
				<View className="flex-1 justify-center items-center">
					<Text>{i18n.t("general.loading")}</Text>
				</View>
			</View>
		);
	}

	return (
		<View className="bg-background-800 h-screen">
			<SafeAreaView className="bg-background-800">
				<View className="flex-row items-center w-full justify-center py-3">
					<View className="flex-row items-center justify-between gap-3 w-[90%]">
						<View className="flex-row items-center gap-3">
							<Button variant="link" onPress={() => router.push(`/(custom-exercise)/${id}`)}>
								<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
							</Button>
							<Heading className="text-typography-950" size="2xl">
								{i18n.t("exercise.page.settings")}
							</Heading>
						</View>
					</View>
				</View>
			</SafeAreaView>

			<ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 200 }}>
				<View className="px-5">
					<VStack space="lg">
						{/* Duration Settings */}
						<Box className="bg-secondary-500 p-5 rounded-md">
							<VStack space="lg" className="px-3 pb-4">
								<View>
									<View className="flex-row justify-between items-center">
										<Heading size="md" className="text-primary-500">
											{i18n.t("exercise.sections.durationSettings")}
										</Heading>
										<Button variant="link" onPress={() => setIsEditing(!isEditing)}>
											<ButtonIcon as={Edit} size="md" />
										</Button>
									</View>
									<Divider className="bg-slate-400" />
								</View>

								<VStack space="3xl" className={`${!isEditing ? "opacity-70" : ""}`}>
									{Object.entries(durationSettings || {}).map(([key, value]) =>
										key !== "parameters" ? (
											<CustomSlider
												key={key}
												title={`exercise.form.${key}`}
												size="md"
												minValue={0.5}
												maxValue={key === "exerciseTime" ? 5 : 15}
												step={0.5}
												value={
													key === "exerciseTime" ? parseFloat(value.toString()) / 60 : parseFloat(value.toString())
												}
												defaultValue={
													key === "exerciseTime" ? parseFloat(value.toString()) / 60 : parseFloat(value.toString())
												}
												suffix={key === "exerciseTime" ? "general.time.minutes" : "general.time.seconds"}
												isReadOnly={!isEditing}
												onChange={(newValue) => handleSliderChange(key, newValue)}
											/>
										) : null
									)}
								</VStack>

								{isEditing && (
									<ButtonGroup className="flex-row self-end py-3">
										<Button variant="outline" onPress={onEditCancel} action="secondary" size="md">
											<ButtonText>{i18n.t("general.buttons.cancel")}</ButtonText>
										</Button>
										<Button onPress={onEditSave} action="primary" size="md">
											<ButtonText>{i18n.t("general.buttons.save")}</ButtonText>
										</Button>
									</ButtonGroup>
								)}
							</VStack>
						</Box>

						{/* Public Access Settings */}
						<Box className="bg-secondary-500 p-5 rounded-md">
							<VStack space="lg">
								<View>
									<Heading size="md" className="text-primary-500">
										{i18n.t("exercise.page.communityAccess")}
									</Heading>
									<Divider className="bg-slate-400" />
								</View>
								<View className="flex-row justify-between items-center">
									<View className="flex-1">
										<Heading size="sm">{i18n.t("exercise.page.makePublic")}</Heading>
										<Text size="xs" className="text-typography-600">
											{i18n.t("exercise.page.makePublicDescription")}
										</Text>
									</View>
									<AnimatedSwitch
										defaultValue={exercises.publicAccess}
										onChange={handlePublicAccessChange}
										onIcon={<Icon as={Eye} />}
										offIcon={<Icon as={EyeOff} />}
										height={25}
										thumbSize={20}
									/>
								</View>
							</VStack>
						</Box>

						{/* Delete Exercise Section - Available for all users */}
						<Box className="bg-secondary-500 p-5 rounded-md">
							<VStack space="lg">
								<View className="flex-row justify-between items-center">
									<View className="flex-1">
										<Heading size="sm">{i18n.t("exercise.page.deleteExercise")}</Heading>
										<Text size="xs" className="text-typography-600">
											{i18n.t("exercise.page.deleteExerciseDescription")}
										</Text>
									</View>
									<Button variant="outline" action="negative" onPress={() => setShowDeleteExerciseAlertModal(true)}>
										<ButtonIcon as={Trash2} size="md" />
										<ButtonText action="negative">{i18n.t("general.buttons.delete")}</ButtonText>
									</Button>
								</View>
							</VStack>
						</Box>

						{/* Cogipro Premium Settings - Only for admins */}
						{user.baseInfo?.isAdmin && (
							<Box className="bg-secondary-500 p-5 rounded-md">
								<VStack space="lg">
									<View>
										<Heading size="md" className="text-primary-500">
											{i18n.t("exercise.page.cogiproPremiumSettings")}
										</Heading>
										<Divider className="bg-slate-400" />
									</View>

									<View className="flex-row justify-between items-center gap-2">
										<View className="flex-1">
											<Heading size="sm">{i18n.t("exercise.page.submitToCogipro")}</Heading>
											<Text size="xs" className="text-typography-600">
												{i18n.t("exercise.page.submitToCogiproDescription")}
											</Text>
										</View>
										<AnimatedSwitch
											key="cogipro-switch"
											value={cogiproSwitchValue}
											onChange={handleCogiproToggle}
											onIcon={<Icon as={Eye} />}
											offIcon={<Icon as={EyeOff} />}
											height={25}
											thumbSize={20}
										/>
									</View>

									<View className="flex-row justify-between items-center gap-2">
										<View className="flex-1">
											<Heading size="sm">{i18n.t("exercise.page.submitToCogiproPremium")}</Heading>
											<Text size="xs" className="text-typography-600">
												{i18n.t("exercise.page.submitToCogiproPremiumDescription")}
											</Text>
										</View>
										<AnimatedSwitch
											key="cogipro-premium-switch"
											value={cogiproPremiumSwitchValue}
											onChange={handleCogiproPremiumToggle}
											onIcon={<Icon as={Eye} />}
											offIcon={<Icon as={EyeOff} />}
											height={25}
											thumbSize={20}
										/>
									</View>
								</VStack>
							</Box>
						)}
					</VStack>
				</View>
			</ScrollView>

			<AlertModal
				isOpen={showSubmitToCogiproAlertModal}
				onClose={() => setShowSubmitToCogiproAlertModal(false)}
				headingKey="exercise.page.submitToCogipro"
				textKey="exercise.page.submitToCogiproMessage"
				buttonKey="general.buttons.confirm"
				onConfirm={submitToCogipro}
				action="primary"
			/>

			<AlertModal
				isOpen={showUnsubmitFromCogiproAlertModal}
				onClose={() => setShowUnsubmitFromCogiproAlertModal(false)}
				headingKey="exercise.page.unsubmitFromCogipro"
				textKey="exercise.page.unsubmitFromCogiproMessage"
				buttonKey="general.buttons.confirm"
				onConfirm={unsubmitFromCogipro}
				action="negative"
			/>

			<AlertModal
				isOpen={showDeleteExerciseAlertModal}
				onClose={() => setShowDeleteExerciseAlertModal(false)}
				headingKey="exercise.page.deleteExercise"
				textKey="exercise.page.deleteExerciseMessage"
				buttonKey="general.buttons.delete"
				onConfirm={handleDeleteExercise}
				action="negative"
			/>

			<AlertModal
				isOpen={showMakePublicAlertModal}
				onClose={() => setShowMakePublicAlertModal(false)}
				headingKey="exercise.page.makePublic"
				textKey="exercise.page.makePublicMessage"
				buttonKey="general.buttons.confirm"
				onConfirm={() => handlePublicAccessChange(true)}
				action="primary"
			/>

			<AlertModal
				isOpen={showSubmitToCogiproPremiumAlertModal}
				onClose={() => setShowSubmitToCogiproPremiumAlertModal(false)}
				headingKey="exercise.page.submitToCogiproPremium"
				textKey="exercise.page.submitToCogiproPremiumMessage"
				buttonKey="general.buttons.confirm"
				onConfirm={submitToCogiproPremium}
				action="primary"
			/>

			<AlertModal
				isOpen={showUnsubmitFromCogiproPremiumAlertModal}
				onClose={() => setShowUnsubmitFromCogiproPremiumAlertModal(false)}
				headingKey="exercise.page.unsubmitFromCogiproPremium"
				textKey="exercise.page.unsubmitFromCogiproPremiumMessage"
				buttonKey="general.buttons.confirm"
				onConfirm={unsubmitFromCogiproPremium}
				action="negative"
			/>
		</View>
	);
}
