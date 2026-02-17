// app/exercise.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
	Exercise,
	setCurrentExercise,
	setPaywallModalPopup,
	getExerciseCustomizedOptions,
	setExerciseStopped,
} from "@/store/data/dataSlice";
import { i18n } from "../../i18n";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import MetronomeService from "@/services/MetronomeService";

// Import exercise handlers
import MathStimulus from "@/components/exercise-handlers/MathStimulus";
import MathOnlyStimulus from "@/components/exercise-handlers/MathOnlyStimulus";
import SimpleStimulus from "@/components/exercise-handlers/SimpleStimulus";
import ShapeCountStimulus from "@/components/exercise-handlers/ShapeCountStimulus";
import Countdown from "@/components/Countdown";
import Header from "@/components/Header";
import MetronomeIndicator from "@/components/MetronomeIndicator";

const handlerMap: Record<
	string,
	React.FC<{ exercise: Exercise; onComplete?: () => void; onStop?: () => void; forcePause?: boolean }>
> = {
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
	const [forceExercisePause, setForceExercisePause] = useState(false);

	const { isSubscribed } = useSubscriptionStatus();
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises);
	const exerciseStopped = useSelector((state: RootState) => state.data.exerciseStopped);

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

	// Handle screen focus/blur to pause exercise when navigating away
	useFocusEffect(
		React.useCallback(() => {
			// Screen is focused - resuming if was paused by navigation
			console.log("🎯 Exercise screen focused");

			return () => {
				// Screen is blurred - pause the exercise
				console.log("🎯 Exercise screen blurred - pausing exercise");
				setForceExercisePause(true);
			};
		}, [])
	);

	// Cleanup: clear selected exercise when component unmounts
	useEffect(() => {
		return () => {
			// Clear the selected exercise when leaving the screen
			dispatch(setCurrentExercise(null as any));
			// dispatch(setExerciseStopped(false));
			// Stop metronome when leaving exercise
			MetronomeService.stop();
		};
	}, []);

	// Handle metronome based on exercise settings
	useEffect(() => {
		console.log("🎵 Exercise useEffect - showCountdown:", showCountdown, "exerciseStopped:", exerciseStopped);

		if (!exercise || showCountdown) {
			console.log("🎵 Skipping metronome start - exercise or countdown active");
			return;
		}

		const customOptions = getExerciseCustomizedOptions(exercise, customizedExercises);
		console.log("🎵 Custom options:", customOptions);

		// Get metronome settings with defaults if not configured
		const metronomeSettings = customOptions.metronome || {
			enabled: false,
			bpm: 120,
		};
		console.log("🎵 Metronome settings:", metronomeSettings);

		if (metronomeSettings.enabled && !exerciseStopped) {
			console.log("🎵 Starting metronome from exercise...");
			// Start metronome when exercise begins
			MetronomeService.start({
				bpm: metronomeSettings.bpm,
				soundEnabled: true,
				soundId: metronomeSettings.soundId ?? "tick",
			});
		} else {
			console.log("🎵 NOT starting metronome - enabled:", metronomeSettings.enabled, "stopped:", exerciseStopped);
			// Ensure any previously-running metronome is stopped when settings disable it
			MetronomeService.stop().catch((err) => console.warn("Metronome stop error:", err));
		}

		return () => {
			// Stop metronome when exercise ends
			console.log("🎵 Stopping metronome (cleanup)");
			MetronomeService.stop();
		};
	}, [exercise, showCountdown, exerciseStopped, customizedExercises]);

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
		// Ensure metronome and Redux state indicate completion
		dispatch(setExerciseStopped(true));
		setShowCountdown(true);
		MetronomeService.stop();
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
		dispatch(setExerciseStopped(true));
		setShowCountdown(false);
		dispatch(setCurrentExercise(null));
		MetronomeService.stop();
		// Navigate back to exercise details page
		router.push(`/(exercise)/${exercise.id}`);
	};

	const handleManualStop = () => {
		setShowCountdown(false);
		MetronomeService.stop();
	};

	return (
		<View className="flex-1">
			<Header
				showSettings={true}
				onBack={handleStopExercise}
				isExerciseActive={!showCountdown && !exerciseStopped}
				isInExerciseExecution={true}
			/>
			<View className="flex-1">
				{showCountdown && (
					<Countdown
						seconds={5}
						isVisible={showCountdown}
						onComplete={() => {
							setShowCountdown(false);
							dispatch(setExerciseStopped(false));
						}}
					/>
				)}
				{!showCountdown && (
					<>
						<MetronomeIndicator position="top" exercise={exercise} />
						<Component
							exercise={exercise}
							onComplete={handleExerciseComplete}
							onStop={handleManualStop}
							forcePause={forceExercisePause}
						/>
					</>
				)}
			</View>
		</View>
	);
}
