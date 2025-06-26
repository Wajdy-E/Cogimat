import { View, SafeAreaView, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Exercise, CustomizableExerciseOptions } from "../../store/data/dataSlice";
import { Button, ButtonGroup, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowLeft, Edit, ArrowRight } from "lucide-react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useExercise } from "@/hooks/useExercise";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { useState, useEffect } from "react";
import { updateExercise } from "../../store/data/dataSlice";
import { i18n } from "../../i18n";
import CustomSlider from "../../components/CustomSlider";

export default function ExerciseSettings() {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const user = useSelector((state: RootState) => state.user.user.baseInfo, shallowEqual);
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

	// Only call useExercise if we have a valid id
	const exerciseData = exerciseId ? useExercise(exerciseId) : null;

	// Handle the case where useExercise returns an array, null, or undefined
	let exercises: Exercise | null = null;
	try {
		if (exerciseData && !Array.isArray(exerciseData) && exerciseData !== null) {
			exercises = exerciseData as Exercise;
		}
	} catch (error) {
		console.error("Error processing exercise data:", error);
	}

	// Customization settings state
	const [showOffScreenColorPicker, setShowOffScreenColorPicker] = useState(false);
	const [showOnScreenColorPicker, setShowOnScreenColorPicker] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [durationSettings, setDurationSettings] = useState<CustomizableExerciseOptions | undefined>(
		exercises?.customizableOptions
	);

	// Update state when exercises data becomes available
	useEffect(() => {
		if (exercises?.customizableOptions) {
			setDurationSettings(exercises.customizableOptions);
		}
	}, [exercises]);

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
					<Text>Loading...</Text>
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
						<Box className="bg-secondary-500 p-5 rounded-2xl">
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
										key !== "onScreenColor" && key !== "offScreenColor" ? (
											<CustomSlider
												key={key}
												title={`exercise.form.${key}`}
												size="md"
												minValue={key === "exerciseTime" ? 1 : 0.5}
												maxValue={key === "exerciseTime" ? 5 : 15}
												step={key === "exerciseTime" ? 0.5 : 0.1}
												value={parseFloat(value.toString())}
												defaultValue={parseFloat(value.toString())}
												suffix={key === "exerciseTime" ? "general.time.minutes" : "general.time.seconds"}
												isReadOnly={!isEditing}
												onChange={(newValue) =>
													setDurationSettings((prev) =>
														prev
															? {
																	...prev,
																	[key]: newValue.toString(),
																}
															: undefined
													)
												}
											/>
										) : null
									)}
								</VStack>

								{isEditing && (
									<ButtonGroup className="flex-row self-end py-3">
										<Button
											variant="outline"
											onPress={() => {
												setIsEditing(false);
												setDurationSettings(exercises.customizableOptions);
											}}
											action="secondary"
											size="md"
										>
											<ButtonText>{i18n.t("general.buttons.cancel")}</ButtonText>
										</Button>
										<Button
											onPress={() => {
												if (durationSettings) {
													dispatch(updateExercise({ ...durationSettings }));
												}
												setIsEditing(false);
											}}
											action="primary"
											size="md"
										>
											<ButtonText>{i18n.t("general.buttons.save")}</ButtonText>
										</Button>
									</ButtonGroup>
								)}
							</VStack>
						</Box>
					</VStack>
				</View>
			</ScrollView>
		</View>
	);
}
