import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { shallowEqual, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Routine, Exercise, CustomExercise } from "../../store/data/dataSlice";
import { i18n } from "../../i18n";

export default function RoutineExecution() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const routineId = parseInt((params.routineId as string) || "0");

	const { routines, exercises, customExercises } = useSelector(
		(state: RootState) => ({
			routines: state.data.routines || [],
			exercises: state.data.exercises || [],
			customExercises: state.data.customExercises || [],
		}),
		shallowEqual
	);

	const routine = routines.find((r) => r.id === routineId);
	const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
	const [isPaused, setIsPaused] = useState(false);
	const [showCountdown, setShowCountdown] = useState(false);
	const [isRoutineComplete, setIsRoutineComplete] = useState(false);
	const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
	const [hasProcessedCompletion, setHasProcessedCompletion] = useState(false);

	// Get current exercise details
	const currentRoutineExercise = routine?.exercises[currentExerciseIndex];
	const currentExercise = currentRoutineExercise
		? currentRoutineExercise.exercise_type === "standard"
			? exercises.find((e) => e.id === currentRoutineExercise.exercise_id)
			: customExercises.find((e) => e.id === currentRoutineExercise.exercise_id)
		: null;
	// Check if we're returning from an exercise completion
	useEffect(() => {
		const returningFromExercise = params?.returnFromExercise === "true";
		const completedExerciseId = params?.completedExerciseId;

		if (returningFromExercise && completedExerciseId && !hasProcessedCompletion) {
			console.log("Exercise completed:", completedExerciseId);
			console.log("Current exercise index:", currentExerciseIndex);
			console.log("Routine exercises length:", routine?.exercises.length);

			// Mark that we've processed this completion
			setHasProcessedCompletion(true);

			// Mark the exercise as completed
			setCompletedExercises((prev) => new Set([...prev, parseInt(completedExerciseId as string)]));

			// Move to next exercise or complete routine
			const totalExercises = routine?.exercises.length || 0;
			const nextIndex = currentExerciseIndex + 1;

			console.log("Total exercises:", totalExercises);
			console.log("Next index:", nextIndex);

			if (nextIndex < totalExercises) {
				console.log("Moving to next exercise");
				setCurrentExerciseIndex(nextIndex);
			} else {
				console.log("Routine complete!");
				setIsRoutineComplete(true);
			}
		}
	}, [params?.returnFromExercise, params?.completedExerciseId, hasProcessedCompletion]);

	// Cleanup: reset state when component unmounts or user navigates away
	useEffect(() => {
		return () => {
			// Reset all routine execution state when leaving the screen
			setCurrentExerciseIndex(0);
			setCompletedExercises(new Set());
			setIsRoutineComplete(false);
			setShowCountdown(false);
			setIsPaused(false);
			setHasProcessedCompletion(false);
		};
	}, []);

	// Reset state when user navigates away and comes back
	useFocusEffect(
		React.useCallback(() => {
			// Reset countdown state when screen comes into focus
			if (showCountdown) {
				setShowCountdown(false);
			}
		}, [showCountdown])
	);

	const progress = routine ? (completedExercises.size / routine.exercises.length) * 100 : 0;

	useEffect(() => {
		if (!routine) {
			router.back();
			return;
		}

		// Check if exercises are loaded
		if (exercises.length === 0 && customExercises.length === 0) {
			console.log("Exercises not loaded yet, waiting...");
		}
	}, [routine, router, exercises.length, customExercises.length]);

	// Show loading if exercises are not loaded yet
	if (!routine || (exercises.length === 0 && customExercises.length === 0)) {
		return <View className="flex-1 justify-center items-center">{/* <Text>{i18n.t("general.loading")}</Text> */}</View>;
	}

	const handleStartExercise = () => {
		if (!currentExercise || !currentRoutineExercise) {
			console.error("Cannot start exercise: current exercise or routine exercise is undefined");
			return;
		}

		// Reset the completion flag when starting a new exercise
		setHasProcessedCompletion(false);
		setShowCountdown(true);
	};

	const handleSkipExercise = () => {
		const totalExercises = routine?.exercises.length || 0;
		const nextIndex = currentExerciseIndex + 1;

		console.log("Skip exercise - Current index:", currentExerciseIndex);
		console.log("Skip exercise - Total exercises:", totalExercises);
		console.log("Skip exercise - Next index:", nextIndex);

		if (nextIndex < totalExercises) {
			console.log("Skip exercise - Moving to next exercise");
			setCurrentExerciseIndex(nextIndex);
		} else {
			console.log("Skip exercise - Routine complete!");
			setIsRoutineComplete(true);
		}
	};

	const handlePauseResume = () => {
		setIsPaused((prev) => !prev);
	};

	const handleEndRoutine = () => {
		// Clear URL parameters to prevent auto-redirect
		router.replace("/(tabs)/progress");

		// Reset all routine execution state
		setCurrentExerciseIndex(0);
		setCompletedExercises(new Set());
		setIsRoutineComplete(false);
		setShowCountdown(false);
		setIsPaused(false);
		setHasProcessedCompletion(false);
	};

	// Handle navigation to exercise when countdown is shown
	useEffect(() => {
		if (showCountdown && currentExercise && currentRoutineExercise) {
			try {
				const exerciseData = JSON.stringify(currentExercise);
				const exerciseType = currentRoutineExercise.exercise_type === "custom" ? "custom-exercise" : "exercise";
				router.push(
					`/(${exerciseType})/exercise?data=${encodeURIComponent(exerciseData)}&routineMode=true&routineId=${routineId}&exerciseIndex=${currentExerciseIndex}`
				);
			} catch (error) {
				console.error("Error navigating to exercise:", error);
				// Fallback: go back to routine execution
				setShowCountdown(false);
			}
		} else if (showCountdown) {
			console.error("Current exercise or routine exercise is undefined");
			setShowCountdown(false);
		}
	}, [showCountdown, currentExercise, currentRoutineExercise, router, routineId, currentExerciseIndex]);

	// Reset countdown if user navigates back without completing exercise
	useEffect(() => {
		const timer = setTimeout(() => {
			if (showCountdown) {
				// If countdown is still showing after 1 second, user probably navigated back
				setShowCountdown(false);
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [showCountdown]);

	if (isRoutineComplete) {
		return (
			<View className="flex-1 bg-background-700 justify-center items-center">
				<VStack space="xl" className="items-center">
					<Icon as={CheckCircle} size="xl" className="text-success-500" />
					<Heading size="2xl">{i18n.t("routines.execution.complete")}</Heading>
					<Text className="text-center text-typography-500">{i18n.t("routines.execution.completeMessage")}</Text>
					<Button size="lg" onPress={handleEndRoutine}>
						<ButtonText>{i18n.t("general.buttons.done")}</ButtonText>
					</Button>
				</VStack>
			</View>
		);
	}

	if (showCountdown) {
		return <View className="flex-1 justify-center items-center">{/* <Text>{i18n.t("general.loading")}</Text> */}</View>;
	}

	return (
		<View className="flex-1 bg-background-700">
			{/* Header */}
			<HStack className="items-center p-4 gap-3">
				<Button size="lg" variant="link" onPress={handleEndRoutine}>
					<ButtonIcon as={ArrowLeft} />
				</Button>
				<Heading size="lg" className="text-typography-950">
					{routine.name}
				</Heading>
				<View className="w-10" />
			</HStack>

			<ScrollView className="flex-1 p-4">
				<VStack space="xl">
					{/* Progress */}
					<Card className="p-4">
						<VStack space="md">
							<HStack className="justify-between">
								<Text>{i18n.t("routines.execution.progress")}</Text>
								<Text>{Math.round(progress)}%</Text>
							</HStack>
							<Progress value={progress} size="lg" />
							<Text className="text-center">
								{completedExercises.size} / {routine.exercises.length} {i18n.t("routines.saved.exercises")}
							</Text>
						</VStack>
					</Card>

					{/* Current Exercise */}
					{currentExercise && (
						<Card className="p-4">
							<VStack space="md">
								<Heading size="md">{i18n.t("routines.execution.currentExercise")}</Heading>
								<HStack className="justify-between items-center">
									<VStack space="sm" className="flex-1">
										<Text className="font-semibold">{currentExercise.name}</Text>
										<Text className="text-typography-500">
											{i18n.t("exercise.difficulty." + currentExercise.difficulty.toLowerCase())}
										</Text>
									</VStack>
									<Text className="text-typography-500">
										{currentExerciseIndex + 1} / {routine.exercises.length}
									</Text>
								</HStack>
							</VStack>
						</Card>
					)}

					{/* Exercise List */}
					<Card className="p-4">
						<Heading size="md" className="mb-4">
							{i18n.t("routines.execution.exerciseList")}
						</Heading>
						<VStack space="sm">
							{routine.exercises.map((routineExercise, index) => {
								const exercise =
									routineExercise.exercise_type === "standard"
										? exercises.find((e) => e.id === routineExercise.exercise_id)
										: customExercises.find((e) => e.id === routineExercise.exercise_id);

								const isCompleted = completedExercises.has(routineExercise.exercise_id);
								const isCurrent = index === currentExerciseIndex;

								return (
									<HStack
										key={`${routineExercise.exercise_type}-${routineExercise.exercise_id}`}
										className={`p-3 rounded-lg ${isCurrent ? "bg-primary-500" : "bg-background-400"}`}
									>
										<HStack className="flex-1 items-center" space="sm">
											{isCompleted ? (
												<Icon as={CheckCircle} size="md" className="text-success-500" />
											) : (
												<View className="w-4 h-4 rounded-full border-2 border-typography-300" />
											)}
											<Text
												className={`font-medium ${isCompleted ? "line-through text-typography-400" : "text-white"}`}
											>
												{exercise?.name || i18n.t("routines.execution.exerciseNotFound")}
											</Text>
										</HStack>
										{isCurrent && (
											<Text className="text-white font-semibold">{i18n.t("routines.execution.current")}</Text>
										)}
									</HStack>
								);
							})}
						</VStack>
					</Card>
				</VStack>
			</ScrollView>

			{/* Control Buttons */}
			<HStack className="justify-center p-4 bg-background-600" space="md" style={{ paddingBottom: 30 }}>
				<Button size="lg" variant="outline" onPress={handleSkipExercise} className="flex-1">
					<ButtonIcon as={SkipForward} />
					<ButtonText>{i18n.t("routines.execution.skip")}</ButtonText>
				</Button>
				<Button size="lg" variant="outline" onPress={handlePauseResume} className="flex-1">
					<ButtonIcon as={isPaused ? Play : Pause} />
					<ButtonText>{isPaused ? i18n.t("routines.execution.resume") : i18n.t("routines.execution.pause")}</ButtonText>
				</Button>
				<Button size="lg" onPress={handleStartExercise} className="flex-1" disabled={!currentExercise}>
					<ButtonIcon as={Play} />
					<ButtonText>{i18n.t("routines.execution.start")}</ButtonText>
				</Button>
			</HStack>
		</View>
	);
}
