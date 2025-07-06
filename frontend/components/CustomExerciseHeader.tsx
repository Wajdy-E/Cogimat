import React, { useState } from "react";
import { View, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { CustomExercise, updateCustomExercise } from "../store/data/dataSlice";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ArrowLeft, Star, Settings } from "lucide-react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import AlertModal from "./AlertModal";
import { i18n } from "../i18n";

interface CustomExerciseHeaderProps {
	showSettings?: boolean;
	onBack?: () => void;
	isExerciseActive?: boolean;
}

export default function Header({ showSettings = true, onBack, isExerciseActive = false }: CustomExerciseHeaderProps) {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const router = useRouter();
	const { themeTextColor } = useTheme();
	const [showExitAlert, setShowExitAlert] = useState(false);

	// Get the current exercise from Redux state
	const exercises = useSelector((state: RootState) => state.data.selectedExercise) as CustomExercise | null;
	const user = useSelector((state: RootState) => state.user.user, shallowEqual);

	const handleBackPress = () => {
		if (isExerciseActive && onBack) {
			// Show confirmation alert if exercise is active
			setShowExitAlert(true);
		} else {
			// Navigate back immediately if exercise is not active
			router.push("/(tabs)/home");
		}
	};

	const handleConfirmExit = () => {
		setShowExitAlert(false);
		// Call the onBack function if provided (to stop exercise)
		if (onBack) {
			onBack();
		}
		// Navigate back
		router.push("/(tabs)/home");
	};

	const handleCancelExit = () => {
		setShowExitAlert(false);
	};

	// Add null check for exercises
	if (!exercises) {
		return (
			<SafeAreaView className="bg-background-800">
				<View className="flex-row items-center w-full justify-center py-3">
					<View className="flex-row items-center justify-between gap-3 w-[90%]">
						<View className="flex-row items-center gap-3 flex-1">
							<Button variant="link" onPress={handleBackPress}>
								<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
							</Button>
							<Heading className="text-typography-950" size="xl" numberOfLines={1} style={{ flex: 1 }}>
								{i18n.t("general.loading")}
							</Heading>
						</View>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	function onFavourite() {
		try {
			if (!exercises) {
				return;
			}

			const exerciseCopy = { ...exercises };
			exerciseCopy.isFavourited = !exercises.isFavourited;
			dispatch(updateCustomExercise(exerciseCopy));
		} catch (error) {
			console.error("Error in onFavourite:", error);
		}
	}

	return (
		<>
			<SafeAreaView className="bg-background-800">
				<View className="flex-row items-center w-full justify-center py-3">
					<View className="flex-row items-center justify-between gap-3 w-[90%]">
						<View className="flex-row items-center gap-3 flex-1">
							<Button variant="link" onPress={handleBackPress}>
								<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
							</Button>
							<Heading className="text-typography-950" size="xl" numberOfLines={1} style={{ flex: 1 }}>
								{exercises.name}
							</Heading>
						</View>
						<View className="flex-row items-center gap-2">
							<Button variant="link" onPress={onFavourite}>
								<ButtonIcon
									as={Star}
									stroke={`${exercises.isFavourited ? "yellow" : themeTextColor}`}
									fill={`${exercises.isFavourited ? "yellow" : themeTextColor}`}
									size={"xxl" as any}
									className={`${exercises.isFavourited ? "fill-yellow-300" : ""}`}
								/>
							</Button>
							{showSettings && (
								<Button variant="link" onPress={() => router.push(`/(custom-exercise)/settings?id=${id}`)}>
									<ButtonIcon as={Settings} size={"xxl" as any} stroke={themeTextColor} />
								</Button>
							)}
						</View>
					</View>
				</View>
			</SafeAreaView>

			<AlertModal
				isOpen={showExitAlert}
				onClose={handleCancelExit}
				headingKey="exercise.exit.title"
				textKey="exercise.exit.message"
				buttonKey="exercise.exit.confirm"
				cancelKey="exercise.exit.cancel"
				onConfirm={handleConfirmExit}
				action="negative"
			/>
		</>
	);
}
