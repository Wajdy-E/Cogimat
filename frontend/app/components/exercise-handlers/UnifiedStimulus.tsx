import React, { useEffect, useState } from "react";
import { Exercise, getExerciseCustomizedOptions, updateExercise } from "@/store/data/dataSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { updateUserMilestone } from "@/store/auth/authSaga";
import ExerciseControl from "../exercises/ExerciseControl";
import ExerciseProgress from "../exercises/ExerciseProgress";
import MetronomeService from "@/services/MetronomeService";

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
	forcePause?: boolean;
}

export default function UnifiedStimulus({
	exercise,
	onComplete,
	onStop,
	strategy,
	forcePause = false,
}: UnifiedStimulusProps) {
	const dispatch = useDispatch<AppDispatch>();
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises);
	const [stimulus, setStimulus] = useState<any>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [stimulusCount, setStimulusCount] = useState<Map<string, number>>(new Map());
	const [timeCompleted, setTimeCompleted] = useState(0);
	const [exerciseCompleted, setExerciseCompleted] = useState(false);

	// Apply force pause when navigating away
	useEffect(() => {
		if (forcePause && !isPaused) {
			setIsPaused(true);
		}
	}, [forcePause]);

	const custom = getExerciseCustomizedOptions(exercise, customizedExercises);
	const metronomeSettings = custom.metronome || { enabled: false, bpm: 120 };
	const isMetronomeMode = metronomeSettings.enabled;

	// Calculate timing based on metronome or manual settings
	const offScreenTime = isMetronomeMode ? 0 : custom.offScreenTime;
	const onScreenTime = isMetronomeMode ? 60 / metronomeSettings.bpm : custom.onScreenTime;
	const totalDuration = custom.exerciseTime;
	const [timeLeft, setTimeLeft] = useState(totalDuration);

	// Initialize stimulus on mount
	useEffect(() => {
		const initialStimulus = strategy.generateStimulus(exercise);
		setStimulus(initialStimulus);
		strategy.incrementStimulusCount(initialStimulus, setStimulusCount);
	}, []);

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
								milestoneType: "exercisesCompleted",
								exerciseDifficulty: exercise.difficulty,
								exerciseId: exercise.id,
								exerciseType: "standard",
							})
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
		if (exerciseCompleted || isPaused) {
			return;
		}

		// Metronome mode: change stimulus on each beat
		if (isMetronomeMode) {
			const unsubscribe = MetronomeService.onBeat(() => {
				const newStimulus = strategy.generateStimulus(exercise);
				setStimulus(newStimulus);
				strategy.incrementStimulusCount(newStimulus, setStimulusCount);
				setIsWhiteScreen(false);
			});

			return unsubscribe;
		}

		// Manual mode: use time-based cycle
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
	}, [isPaused, exerciseCompleted, strategy, exercise, totalDuration, onScreenTime, offScreenTime, isMetronomeMode]);

	// Handle metronome pause/resume when isPaused changes
	useEffect(() => {
		if (isPaused && isMetronomeMode) {
			MetronomeService.pause();
		} else if (!isPaused && isMetronomeMode) {
			MetronomeService.resume();
		}
	}, [isPaused, isMetronomeMode]);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	// Function to stop the exercise
	const handleStopExercise = () => {
		setExerciseCompleted(true);
		setIsPaused(true);
		MetronomeService.stop();
		if (onStop) {
			onStop();
		}
	};

	function onEnd() {
		setExerciseCompleted(false);
		setTimeCompleted(0);
		setStimulusCount(new Map());
		setTimeLeft(custom.exerciseTime);
		setIsPaused(false);
		if (onComplete) {
			onComplete();
		}
	}

	function onMetronomeChange(newSettings: { enabled: boolean; bpm: number }) {
		dispatch(
			updateExercise({
				exerciseId: exercise.id,
				options: {
					...custom,
					metronome: newSettings,
				},
			})
		);

		// Always stop metronome when settings change during paused exercise
		// It will be started again when exercise resumes
		MetronomeService.stop();
	}

	if (exerciseCompleted) {
		return (
			<ExerciseProgress
				repsCompleted={Array.from(stimulusCount.values()).reduce((a, b) => a + b, 0)}
				totalTime={timeCompleted}
				onEnd={onEnd}
				onRestart={() => {
					setExerciseCompleted(false);
					setTimeCompleted(0);
					setStimulusCount(new Map());
					setTimeLeft(custom.exerciseTime);
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
				exerciseId={exercise.id}
				metronomeSettings={metronomeSettings}
				onMetronomeChange={onMetronomeChange}
			/>
		</>
	);
}
