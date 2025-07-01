import React, { useEffect, useState } from 'react';
import { Exercise } from '../../store/data/dataSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store/store';
import { updateUserMilestone } from '../../store/auth/authSaga';
import ExerciseControl from '../exercises/ExerciseControl';
import ExerciseProgress from '../exercises/ExerciseProgress';

export interface StimulusStrategy {
	generateStimulus: (exercise: Exercise) => any;
	renderStimulus: (stimulus: any, isWhiteScreen: boolean) => React.ReactNode;
	getProgressData: (stimulusCount: Map<string, number>) => any[];
	getTableHeaders: () => string[];
	incrementStimulusCount: (
		stimulus: any,
		setStimulusCount: React.Dispatch<React.SetStateAction<Map<string, number>>>
	) => void;
}

interface UnifiedStimulusProps {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
	strategy: StimulusStrategy;
}

export default function UnifiedStimulus ({ exercise, onComplete, onStop, strategy }: UnifiedStimulusProps) {
	const dispatch = useDispatch<AppDispatch>();
	const [stimulus, setStimulus] = useState<any>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [stimulusCount, setStimulusCount] = useState<Map<string, number>>(new Map());
	const [timeCompleted, setTimeCompleted] = useState(0);
	const [exerciseCompleted, setExerciseCompleted] = useState(false);

	const custom = exercise.customizableOptions;
	const offScreenTime = custom?.offScreenTime ?? 0.5;
	const onScreenTime = custom?.onScreenTime ?? 1;
	const totalDuration = parseInt(exercise.timeToComplete) || 60;
	const [timeLeft, setTimeLeft] = useState(totalDuration);

	// Independent timer effect
	useEffect(() => {
		if (exerciseCompleted) {
			return;
		}

		const timer = setInterval(() => {
			if (!isPaused && timeLeft > 0) {
				setTimeLeft((prev) => {
					const newTime = prev - 1;
					if (newTime <= 0) {
						setExerciseCompleted(true);
						// Update milestones
						dispatch(
							updateUserMilestone({
								milestoneType: 'exercisesCompleted',
								exerciseDifficulty: exercise.difficulty,
							}),
						);
					}
					return Math.max(newTime, 0);
				});
				setTimeCompleted((prev) => prev + 1);
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [isPaused, timeLeft, exerciseCompleted, dispatch, exercise.difficulty]);

	// Stimulus cycle effect
	useEffect(() => {
		if (exerciseCompleted) {
			return;
		}

		let elapsed = 0;
		let active = true;

		const runCycle = async () => {
			while (active && elapsed < totalDuration && !isPaused && !exerciseCompleted) {
				setIsWhiteScreen(false);
				const newStimulus = strategy.generateStimulus(exercise);
				setStimulus(newStimulus);
				strategy.incrementStimulusCount(newStimulus, setStimulusCount);

				await delay(onScreenTime * 1000);
				setIsWhiteScreen(true);
				await delay(offScreenTime * 1000);

				elapsed += onScreenTime + offScreenTime;
			}
		};

		runCycle();
		return () => {
			active = false;
		};
	}, [isPaused, exerciseCompleted, strategy, exercise, totalDuration, onScreenTime, offScreenTime]);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	// Function to stop the exercise
	const handleStopExercise = () => {
		setExerciseCompleted(true);
		setIsPaused(true);
		if (onStop) {
			onStop();
		}
	};

	if (exerciseCompleted) {
		return (
			<ExerciseProgress
				repsCompleted={Array.from(stimulusCount.values()).reduce((a, b) => a + b, 0)}
				totalTime={timeCompleted}
				onEnd={onComplete || (() => {})}
				onRestart={() => {
					setExerciseCompleted(false);
					setTimeCompleted(0);
					setStimulusCount(new Map());
					setTimeLeft(totalDuration);
					setIsPaused(false);
				}}
				rowData={strategy.getProgressData(stimulusCount)}
				tableHeadKeys={strategy.getTableHeaders()}
			/>
		);
	}

	return (
		<>
			{strategy.renderStimulus(stimulus, isWhiteScreen)}
			<ExerciseControl
				isPaused={isPaused}
				setStimulus={setStimulus}
				setIsWhiteScreen={setIsWhiteScreen}
				setIsPaused={setIsPaused}
				totalDuration={totalDuration}
				setTimeLeft={setTimeLeft}
				timeLeft={timeLeft}
				onStop={handleStopExercise}
			/>
		</>
	);
}
