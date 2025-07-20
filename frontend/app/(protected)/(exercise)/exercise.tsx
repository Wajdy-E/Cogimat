// app/exercise.tsx
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { Exercise, setCurrentExercise, setPaywallModalPopup } from "@/store/data/dataSlice";
import { i18n } from "../../i18n";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";

// Import exercise handlers
import MathStimulus from "@/components/exercise-handlers/MathStimulus";
import MathOnlyStimulus from "@/components/exercise-handlers/MathOnlyStimulus";
import SimpleStimulus from "@/components/exercise-handlers/SimpleStimulus";
import ShapeCountStimulus from "@/components/exercise-handlers/ShapeCountStimulus";
import Countdown from "@/components/Countdown";
import Header from "@/components/Header";

const handlerMap: Record<string, React.FC<{ exercise: Exercise; onComplete?: () => void; onStop?: () => void }>> = {
	default: SimpleStimulus,
	"letter-sequence": SimpleStimulus,
	"shape-color-combo": SimpleStimulus,
	"math-combo": MathStimulus,
	"math-only": MathOnlyStimulus,
	"shape-count": ShapeCountStimulus,
};

export default function ExerciseRouter() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const dispatch: AppDispatch = useDispatch();
	const [showCountdown, setShowCountdown] = useState(true);
	const [exerciseStopped, setExerciseStopped] = useState(false);

	const { isSubscribed } = useSubscriptionStatus();

	// Check if this is routine mode
	const isRoutineMode = params?.routineMode === "true";
	const routineId = params?.routineId;

	let exercise: Exercise | undefined;
	try {
		exercise = params?.data ? JSON.parse(params.data as string) : undefined;
	} catch {
		exercise = undefined;
	}

	// Check if this is a premium exercise and user is not subscribed
	useEffect(() => {
		if (exercise?.isPremium && !isSubscribed) {
			// Show paywall instead of allowing exercise execution
			dispatch(setPaywallModalPopup(true));
			// Navigate back to prevent access
			router.back();
			return;
		}
	}, [exercise, isSubscribed, dispatch, router]);

	// Set the current exercise in Redux state
	useEffect(() => {
		if (exercise) {
			dispatch(setCurrentExercise(exercise));
		}
	}, [exercise, dispatch]);

	// Cleanup: clear selected exercise when component unmounts
	useEffect(() => {
		return () => {
			// Clear the selected exercise when leaving the screen
			dispatch(setCurrentExercise(null as any));
		};
	}, [dispatch]);

	// Early return after all hooks
	if (!exercise) {
		return <Text>{i18n.t("exercise.invalidOrMissing")}</Text>;
	}

	// Additional check for premium exercises
	if (exercise.isPremium && !isSubscribed) {
		return <Text>{i18n.t("exercise.premium.upgradeMessage")}</Text>;
	}

	const Component = handlerMap[exercise.type] || handlerMap.default;

	const handleExerciseComplete = () => {
		if (isRoutineMode && routineId && exercise) {
			router.push(
				`/(tabs)/routine-execution?routineId=${routineId}&returnFromExercise=true&completedExerciseId=${exercise.id}`
			);
		} else {
			// Navigate back to the specific exercise page
			router.push(`/(exercise)/${exercise.id}`);
		}
	};

	const handleStopExercise = () => {
		setExerciseStopped(true);
		setShowCountdown(false);
		dispatch(setCurrentExercise(null));
	};

	const handleManualStop = () => {
		// Don't set exerciseStopped to true here - let the exercise handler show its progress
		// Only update the header state
		setShowCountdown(false);
	};

	return (
		<View className="flex-1">
			<Header showSettings={true} onBack={handleStopExercise} isExerciseActive={!showCountdown && !exerciseStopped} />
			<View className="flex-1">
				{showCountdown && (
					<Countdown seconds={5} isVisible={showCountdown} onComplete={() => setShowCountdown(false)} />
				)}
				{!showCountdown && (
					<Component exercise={exercise} onComplete={handleExerciseComplete} onStop={handleManualStop} />
				)}
			</View>
		</View>
	);
}
