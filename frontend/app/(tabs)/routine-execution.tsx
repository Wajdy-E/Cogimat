import React, { useEffect, useRef } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText, ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { ArrowLeft, Play, SkipForward, CheckCircle } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import {
	startRoutineExecution,
	completeExercise,
	nextExercise,
	skipExercise,
	setRoutineComplete,
	setShowCountdown,
	resetRoutineExecution,
} from '../../store/data/dataSlice';
import { i18n } from '../../i18n';

export default function RoutineExecution () {
	const params = useLocalSearchParams();
	const router = useRouter();
	const dispatch = useDispatch();
	const routineId = parseInt((params.routineId as string) || '0');
	const processedCompletions = useRef<Set<string>>(new Set());

	const { routines, exercises, customExercises, routineExecution } = useSelector(
		(state: RootState) => ({
			routines: state.data.routines || [],
			exercises: state.data.exercises || [],
			customExercises: state.data.customExercises || [],
			routineExecution: state.data.routineExecution,
		}),
		shallowEqual,
	);

	const routine = routines.find((r) => r.id === routineId);

	// Initialize routine execution if not already started
	useEffect(() => {
		if (routine && !routineExecution) {
			dispatch(startRoutineExecution({ routineId }));
		}
	}, [routine, routineExecution, dispatch, routineId]);

	// Get current exercise details
	const currentRoutineExercise = routine?.exercises[routineExecution?.currentExerciseIndex || 0];
	const currentExercise = currentRoutineExercise
		? currentRoutineExercise.exercise_type === 'standard'
			? exercises.find((e) => e.id === currentRoutineExercise.exercise_id)
			: customExercises.find((e) => e.id === currentRoutineExercise.exercise_id)
		: null;

	// Check if we're returning from an exercise completion
	useEffect(() => {
		const returningFromExercise = params?.returnFromExercise === 'true';
		const completedExerciseId = params?.completedExerciseId;

		if (returningFromExercise && completedExerciseId && routineExecution) {
			const completionKey = `${completedExerciseId}-${routineExecution.currentExerciseIndex}`;

			// Check if we've already processed this completion
			if (processedCompletions.current.has(completionKey)) {
				return;
			}

			// Mark this completion as processed
			processedCompletions.current.add(completionKey);

			// Mark the exercise as completed
			dispatch(completeExercise({ exerciseId: parseInt(completedExerciseId as string) }));

			// Move to next exercise or complete routine
			const totalExercises = routine?.exercises.length || 0;
			const nextIndex = routineExecution.currentExerciseIndex + 1;

			if (nextIndex < totalExercises) {
				dispatch(nextExercise());
			} else {
				dispatch(setRoutineComplete());
			}

			// Clear URL parameters to prevent issues with subsequent completions
			router.setParams({ returnFromExercise: undefined, completedExerciseId: undefined });
		}
	}, [params?.returnFromExercise, params?.completedExerciseId, routine?.exercises.length, dispatch, router]);

	// Cleanup: reset state when component unmounts or user navigates away
	useEffect(() => {
		return () => {
			// Reset all routine execution state when leaving the screen
			dispatch(resetRoutineExecution());
			processedCompletions.current.clear();
		};
	}, [dispatch]);

	// Reset state when user navigates away and comes back
	useFocusEffect(
		React.useCallback(() => {
			// Reset countdown state when screen comes into focus
			if (routineExecution?.showCountdown) {
				dispatch(setShowCountdown(false));
			}
		}, [routineExecution?.showCountdown, dispatch]),
	);

	// Handle navigation to exercise when countdown is shown
	useEffect(() => {
		if (routineExecution?.showCountdown && currentExercise && currentRoutineExercise) {
			try {
				const exerciseData = JSON.stringify(currentExercise);
				const exerciseType = currentRoutineExercise.exercise_type === 'custom' ? 'custom-exercise' : 'exercise';
				router.push(
					`/(${exerciseType})/exercise?data=${encodeURIComponent(exerciseData)}&routineMode=true&routineId=${routineId}&exerciseIndex=${routineExecution?.currentExerciseIndex}`,
				);
			} catch (error) {
				console.error('Error navigating to exercise:', error);
				// Fallback: go back to routine execution
				dispatch(setShowCountdown(false));
			}
		} else if (routineExecution?.showCountdown) {
			console.error('Current exercise or routine exercise is undefined');
			dispatch(setShowCountdown(false));
		}
	}, [routineExecution?.showCountdown, currentExercise, currentRoutineExercise, router, routineId]);

	// Reset countdown if user navigates back without completing exercise
	useEffect(() => {
		const timer = setTimeout(() => {
			if (routineExecution?.showCountdown) {
				// If countdown is still showing after 1 second, user probably navigated back
				dispatch(setShowCountdown(false));
			}
		}, 1000);

		return () => clearTimeout(timer);
	}, [routineExecution?.showCountdown, dispatch]);

	const progress = routine ? ((routineExecution?.completedExercises.length || 0) / routine.exercises.length) * 100 : 0;

	useEffect(() => {
		if (!routine) {
			router.back();
			return;
		}

		// Check if exercises are loaded
		if (exercises.length === 0 && customExercises.length === 0) {
			// Exercises not loaded yet, waiting...
		}
	}, [routine, router, exercises.length, customExercises.length]);

	// Early returns after all hooks
	if (!routine || (exercises.length === 0 && customExercises.length === 0)) {
		return <View className="flex-1 justify-center items-center">{/* <Text>{i18n.t("general.loading")}</Text> */}</View>;
	}

	const handleStartExercise = () => {
		if (!currentExercise || !currentRoutineExercise) {
			console.error('Cannot start exercise: current exercise or routine exercise is undefined');
			return;
		}

		// Clear any existing URL parameters
		router.setParams({ returnFromExercise: undefined, completedExerciseId: undefined });

		// Clear processed completions for the new exercise
		processedCompletions.current.clear();

		dispatch(setShowCountdown(true));
	};

	const handleSkipExercise = () => {
		const totalExercises = routine?.exercises.length || 0;
		const nextIndex = (routineExecution?.currentExerciseIndex || 0) + 1;

		// Mark the current exercise as completed when skipping
		if (currentRoutineExercise) {
			dispatch(completeExercise({ exerciseId: currentRoutineExercise.exercise_id }));
		}

		if (nextIndex < totalExercises) {
			dispatch(skipExercise());
		} else {
			dispatch(setRoutineComplete());
		}
	};

	const handleEndRoutine = () => {
		// Clear URL parameters to prevent auto-redirect
		router.replace('/(tabs)/progress');

		// Reset all routine execution state
		dispatch(resetRoutineExecution());
		processedCompletions.current.clear();
	};

	const handleRestartRoutine = () => {
		// Clear URL parameters
		router.setParams({ returnFromExercise: undefined, completedExerciseId: undefined });

		// Reset all routine execution state and start fresh
		dispatch(resetRoutineExecution());
		processedCompletions.current.clear();

		// Initialize the routine execution again
		dispatch(startRoutineExecution({ routineId }));
	};

	// Early returns after all hooks
	if (routineExecution?.isRoutineComplete) {
		return (
			<View className="flex-1 bg-background-700 justify-center items-center">
				<VStack space="xl" className="items-center max-w-[90%]">
					<Icon as={CheckCircle} size="xl" className="text-success-500" />
					<Heading size="2xl">{i18n.t('routines.execution.complete')}</Heading>
					<Text className="text-center text-typography-500">{i18n.t('routines.execution.completeMessage')}</Text>
					<HStack space="md">
						<Button size="lg" variant="outline" onPress={handleRestartRoutine} className="flex-1">
							<ButtonText>{i18n.t('general.buttons.restart')}</ButtonText>
						</Button>
						<Button size="lg" onPress={handleEndRoutine} className="flex-1">
							<ButtonText>{i18n.t('general.buttons.done')}</ButtonText>
						</Button>
					</HStack>
				</VStack>
			</View>
		);
	}

	if (routineExecution?.showCountdown) {
		return (
			<View className="flex-1 justify-center items-center">
				<Text>{i18n.t('general.loading')}</Text>
			</View>
		);
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
								<Text>{i18n.t('routines.execution.progress')}</Text>
								<Text>{Math.round(progress)}%</Text>
							</HStack>
							<Progress value={progress} size="lg">
								<ProgressFilledTrack className="bg-primary-500" />
							</Progress>
							<Text className="text-center">
								{routineExecution?.completedExercises.length} / {routine.exercises.length}{' '}
								{i18n.t('routines.saved.exercises')}
							</Text>
						</VStack>
					</Card>

					{/* Current Exercise */}
					{currentExercise && (
						<Card className="p-4">
							<VStack space="md">
								<Heading size="md">{i18n.t('routines.execution.currentExercise')}</Heading>
								<HStack className="justify-between items-center">
									<VStack space="sm" className="flex-1">
										<Text className="font-semibold">{currentExercise.name}</Text>
										<Text className="text-typography-500">
											{i18n.t('exercise.difficulty.' + currentExercise.difficulty.toLowerCase())}
										</Text>
									</VStack>
									<Text className="text-typography-500">
										{(routineExecution?.currentExerciseIndex || 0) + 1} / {routine.exercises.length}
									</Text>
								</HStack>
							</VStack>
						</Card>
					)}

					{/* Exercise List */}
					<Card className="p-4">
						<Heading size="md" className="mb-4">
							{i18n.t('routines.execution.exerciseList')}
						</Heading>
						<VStack space="sm">
							{routine.exercises.map((routineExercise, index) => {
								const exercise =
									routineExercise.exercise_type === 'standard'
										? exercises.find((e) => e.id === routineExercise.exercise_id)
										: customExercises.find((e) => e.id === routineExercise.exercise_id);

								const isCompleted = routineExecution?.completedExercises.includes(routineExercise.exercise_id);
								const isCurrent = index === (routineExecution?.currentExerciseIndex || 0);

								return (
									<HStack
										key={`${routineExercise.exercise_type}-${routineExercise.exercise_id}`}
										className={`p-3 rounded-lg ${isCurrent ? 'bg-primary-500' : 'bg-background-400'}`}
									>
										<HStack className="flex-1 items-center" space="sm">
											{isCompleted ? (
												<Icon as={CheckCircle} size="md" className="text-success-500" />
											) : (
												<View className="w-4 h-4 rounded-full border-2 border-typography-300" />
											)}
											<Text
												className={`font-medium ${isCompleted ? 'line-through text-typography-400' : 'text-white'}`}
											>
												{exercise?.name || i18n.t('routines.execution.exerciseNotFound')}
											</Text>
										</HStack>
										{isCurrent && (
											<Text className="text-white font-semibold">{i18n.t('routines.execution.current')}</Text>
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
					<ButtonText>{i18n.t('routines.execution.skip')}</ButtonText>
				</Button>
				<Button size="lg" onPress={handleStartExercise} className="flex-1" disabled={!currentExercise}>
					<ButtonIcon as={Play} />
					<ButtonText>{i18n.t('routines.execution.start')}</ButtonText>
				</Button>
			</HStack>
		</View>
	);
}
