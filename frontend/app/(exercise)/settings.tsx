import { View, SafeAreaView, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Exercise, CustomizableExerciseOptions } from "../../store/data/dataSlice";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useExercise } from "@/hooks/useExercise";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { useState, useEffect } from "react";
import { updateExercise, getExerciseCustomizedOptions } from "../../store/data/dataSlice";
import { i18n } from "../../i18n";
import CustomSlider from "../../components/CustomSlider";
import ExerciseVideoUpload from "../../components/ExerciseVideoUpload";

export default function ExerciseSettings() {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user.user.baseInfo, shallowEqual);
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises, shallowEqual);
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

	const exerciseData = useExercise(exerciseId);

	// Handle the case where useExercise returns an array, null, or undefined
	let exercises: Exercise | null = null;
	try {
		if (exerciseData && !Array.isArray(exerciseData) && exerciseData !== null) {
			exercises = exerciseData as Exercise;
		}
	} catch (error) {
		console.error("Error processing exercise data:", error);
	}

	const [isEditing, setIsEditing] = useState(false);
	const [durationSettings, setDurationSettings] = useState<CustomizableExerciseOptions>(
		exercises
			? getExerciseCustomizedOptions(exercises, customizedExercises)
			: {
					exerciseTime: 150,
					offScreenTime: 0.5,
					onScreenTime: 1,
				}
	);

	// Update durationSettings when exercise or customizedExercises change
	useEffect(() => {
		if (exercises) {
			setDurationSettings(getExerciseCustomizedOptions(exercises, customizedExercises));
		}
	}, [exercises, customizedExercises]);

	// Admin video upload state
	const [showVideoUpload, setShowVideoUpload] = useState(false);

	const handleSliderChange = (key: string, newValue: number) => {
		setDurationSettings((prev) => ({
			...prev,
			[key]: key === "exerciseTime" ? (newValue * 60).toString() : newValue.toString(),
		}));
	};

	function onEditCancel() {
		if (!exercises) {
			return;
		}
		setDurationSettings({ ...getExerciseCustomizedOptions(exercises, customizedExercises) });
		setIsEditing(false);
	}

	function onEditSave() {
		if (!exercises) {
			return;
		}

		dispatch(updateExercise({ exerciseId: exercises.id, options: { ...durationSettings } }));

		setIsEditing(false);
	}
	const handleVideoUploadSuccess = () => {
		setShowVideoUpload(false);
	};

	// Early return if exercise data is not yet available
	if (!exercises) {
		return (
			<View className="bg-background-800 h-screen">
				<SafeAreaView className="bg-background-800">
					<View className="flex-row items-center w-full justify-center py-3">
						<View className="flex-row items-center justify-between gap-3 w-[90%]">
							<View className="flex-row items-center gap-3">
								<Button variant="link" onPress={() => router.push(`/(exercise)/${id}`)}>
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
							<Button variant="link" onPress={() => router.push(`/(exercise)/${id}`)}>
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
									{Object.entries(durationSettings).map(([key, value]) => (
										<CustomSlider
											key={key}
											title={`exercise.form.${key}`}
											size="md"
											minValue={0.5}
											maxValue={key === "exerciseTime" ? 5 : 15}
											step={0.5}
											value={key === "exerciseTime" ? parseFloat(value.toString()) / 60 : parseFloat(value.toString())}
											defaultValue={
												key === "exerciseTime" ? parseFloat(value.toString()) / 60 : parseFloat(value.toString())
											}
											suffix={key === "exerciseTime" ? "general.time.minutes" : "general.time.seconds"}
											isReadOnly={!isEditing}
											onChange={(newValue) => handleSliderChange(key, newValue)}
										/>
									))}
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

						{/* Admin Video Upload Section */}
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
											exerciseId={exercises.id}
											exerciseName={exercises.name}
											onUploadSuccess={handleVideoUploadSuccess}
											onClose={() => setShowVideoUpload(false)}
										/>
									) : (
										<Button onPress={() => setShowVideoUpload(true)} action="primary" className="w-full">
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
