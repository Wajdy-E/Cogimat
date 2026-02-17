import { View, SafeAreaView, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Exercise, CustomizableExerciseOptions } from "@/store/data/dataSlice";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useExercise } from "@/hooks/useExercise";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { useState, useEffect } from "react";
import { updateExercise, getExerciseCustomizedOptions } from "@/store/data/dataSlice";
import { i18n } from "../../i18n";
import CustomSlider from "@/components/CustomSlider";
import ExerciseVideoUpload from "@/components/ExerciseVideoUpload";
import MetronomeControl, { MetronomeSettings } from "@/components/MetronomeControl";
import MetronomeService from "@/services/MetronomeService";

export default function ExerciseSettings() {
	const dispatch: AppDispatch = useDispatch();
	const params = useLocalSearchParams();
	const user = useSelector((state: RootState) => state.user.user.baseInfo, shallowEqual);
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises, shallowEqual);
	const selectedExercise = useSelector((state: RootState) => state.data.selectedExercise, shallowEqual);
	const id = selectedExercise?.id;
	const router = useRouter();
	const { themeTextColor } = useTheme();

	// Check if we came from an active exercise
	const fromExercise = params?.fromExercise === "true";

	// Safely handle the id parameter
	let exerciseId: number | null = null;
	console.log("📋 Settings: Retrieved id param:", id);
	try {
		if (id && typeof id === "string") {
			exerciseId = parseInt(id);
		}
	} catch (error) {
		console.error("Error parsing exercise id:", error);
	}

	const [isEditing, setIsEditing] = useState(false);
	const [durationSettings, setDurationSettings] = useState<CustomizableExerciseOptions>(
		selectedExercise
			? getExerciseCustomizedOptions(selectedExercise as Exercise, customizedExercises)
			: {
					exerciseTime: 150,
					offScreenTime: 0.5,
					onScreenTime: 1,
				}
	);

	// Metronome settings state
	const [metronomeSettings, setMetronomeSettings] = useState<MetronomeSettings>({
		enabled: false,
		bpm: 120,
	});

	// Auto-save metronome settings when they change
	const handleMetronomeChange = (newSettings: MetronomeSettings) => {
		console.log("🎵 Metronome settings changed:", newSettings);
		setMetronomeSettings(newSettings);

		// Auto-save to Redux
		if (selectedExercise) {
			console.log("💾 Auto-saving metronome settings...");
			dispatch(
				updateExercise({
					exerciseId: selectedExercise.id,
					options: {
						...durationSettings,
						metronome: newSettings,
					},
				})
			);
			console.log("✅ Metronome settings auto-saved");
		}
	};

	// Stop metronome when entering settings page (but only if not from active exercise)
	useEffect(() => {
		if (!fromExercise) {
			MetronomeService.stop();
		}

		return () => {
			// Stop on unmount only if not returning to exercise
			if (!fromExercise) {
				MetronomeService.stop();
			}
		};
	}, [fromExercise]);

	// Update durationSettings when exercise or customizedExercises change
	useEffect(() => {
		if (selectedExercise) {
			const customOptions = getExerciseCustomizedOptions(selectedExercise as Exercise, customizedExercises);
			setDurationSettings(customOptions);

			// Load metronome settings if they exist
			if (customOptions.metronome) {
				setMetronomeSettings({
					enabled: customOptions.metronome.enabled,
					bpm: customOptions.metronome.bpm,
					soundId: customOptions.metronome.soundId ?? "tick",
				});
			}
		}
	}, [selectedExercise, customizedExercises]);

	// Admin video upload state
	const [showVideoUpload, setShowVideoUpload] = useState(false);

	const handleSliderChange = (key: string, newValue: number) => {
		setDurationSettings((prev) => ({
			...prev,
			[key]: key === "exerciseTime" ? (newValue * 60).toString() : newValue.toString(),
		}));
	};

	function onEditCancel() {
		if (!selectedExercise) {
			return;
		}
		const customOptions = getExerciseCustomizedOptions(selectedExercise as Exercise, customizedExercises);
		setDurationSettings({ ...customOptions });
		if (customOptions.metronome) {
			setMetronomeSettings({
				enabled: customOptions.metronome.enabled,
				bpm: customOptions.metronome.bpm,
				soundId: customOptions.metronome.soundId ?? "tick",
			});
		}
		setIsEditing(false);
	}

	function onEditSave() {
		if (!selectedExercise) {
			return;
		}

		console.log("💾 Saving exercise settings...");
		console.log("💾 Duration settings:", durationSettings);
		console.log("💾 Metronome settings:", metronomeSettings);

		dispatch(
			updateExercise({
				exerciseId: selectedExercise.id,
				options: {
					...durationSettings,
					metronome: metronomeSettings,
				},
			})
		);

		console.log("✅ Settings saved to Redux");
		setIsEditing(false);
	}
	const handleVideoUploadSuccess = () => {
		setShowVideoUpload(false);
	};

	// Early return if exercise data is not yet available
	if (!selectedExercise) {
		return (
			<View className="bg-background-800 h-screen">
				<SafeAreaView className="bg-background-800">
					<View className="flex-row items-center w-full justify-center py-3">
						<View className="flex-row items-center justify-between gap-3 w-[90%]">
							<View className="flex-row items-center gap-3">
								<Button
									variant="link"
									onPress={() => {
										if (fromExercise) {
											// Go back to the active exercise
											router.back();
										} else {
											// Go to exercise details page
											router.push(`/(exercise)/${id}`);
										}
									}}
								>
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
							<Button
								variant="link"
								onPress={() => {
									if (fromExercise) {
										// Go back to the active exercise
										router.back();
									} else {
										// Go to exercise details page
										router.push(`/(exercise)/${id}`);
									}
								}}
							>
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
									{Object.entries(durationSettings)
										.filter(([key]) => {
											// Filter out metronome
											if (key === "metronome") return false;
											// Hide onScreenTime and offScreenTime when metronome is enabled
											if (
												metronomeSettings.enabled &&
												(key === "onScreenTime" || key === "offScreenTime")
											) {
												return false;
											}
											return true;
										})
										.map(([key, value]) => (
											<CustomSlider
												key={key}
												title={`exercise.form.${key}`}
												size="md"
												minValue={0.5}
												maxValue={key === "exerciseTime" ? 5 : 15}
												step={0.5}
												value={
													key === "exerciseTime"
														? parseFloat(value.toString()) / 60
														: parseFloat(value.toString())
												}
												defaultValue={
													key === "exerciseTime"
														? parseFloat(value.toString()) / 60
														: parseFloat(value.toString())
												}
												suffix={
													key === "exerciseTime"
														? "general.time.minutes"
														: "general.time.seconds"
												}
												isReadOnly={!isEditing}
												onChange={(newValue) => handleSliderChange(key, newValue)}
											/>
										))}

									{metronomeSettings.enabled && (
										<Text className="text-typography-600 text-sm italic">
											{i18n.t("metronome.timingNote")}
										</Text>
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

						<Box className="bg-secondary-500 p-5 rounded-md">
							<VStack space="lg" className="px-3 pb-4">
								<View>
									<Heading size="md" className="text-primary-500">
										{i18n.t("metronome.title")}
									</Heading>
									<Divider className="bg-slate-400" />
								</View>

								<MetronomeControl
									settings={metronomeSettings}
									onChange={handleMetronomeChange}
									showVisualIndicator={false}
								/>

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

						{user?.isAdmin && (
							<Box className="bg-secondary-500 p-5 rounded-md">
								<VStack space="lg">
									<View>
										<Heading size="md" className="text-primary-500">
											{i18n.t("exercise.sections.adminVideoUpload")}
										</Heading>
										<Divider className="bg-slate-400" />
									</View>

									{showVideoUpload ? (
										<ExerciseVideoUpload
											exerciseId={selectedExercise.id}
											exerciseName={selectedExercise.name}
											onUploadSuccess={handleVideoUploadSuccess}
											onClose={() => setShowVideoUpload(false)}
										/>
									) : (
										<Button
											onPress={() => setShowVideoUpload(true)}
											action="primary"
											className="w-full"
										>
											<ButtonText>{i18n.t("exercise.sections.uploadVideo")}</ButtonText>
										</Button>
									)}
								</VStack>
							</Box>
						)}
					</VStack>
				</View>
			</ScrollView>
		</View>
	);
}
