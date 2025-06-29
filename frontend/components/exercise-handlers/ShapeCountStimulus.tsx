// components/exerciseHandlers/ShapeCountStimulus.tsx

import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Square, Circle, Triangle, Diamond, LucideIcon } from "lucide-react-native";
import { Exercise } from "../../store/data/dataSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { updateUserMilestone } from "../../store/auth/authSaga";
import ExerciseControl from "../exercises/ExerciseControl";
import ExerciseProgress from "../exercises/ExerciseProgress";

interface ShapeStimulus {
	type: string;
	color: string;
	icon: LucideIcon;
}

export default function ShapeCountStimulus({
	exercise,
	onComplete,
	onStop,
}: {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
}) {
	const dispatch = useDispatch<AppDispatch>();
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [stimulus, setStimulus] = useState<ShapeStimulus[]>([]);
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
		if (exerciseCompleted) return;

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
		if (exerciseCompleted) return;

		let elapsed = 0;
		let active = true;

		const runCycle = async () => {
			while (active && elapsed < totalDuration && !isPaused && !exerciseCompleted) {
				setIsWhiteScreen(false);
				const newStimulus = generateRandomStimulus();
				setStimulus(newStimulus);
				incrementStimulusCount(newStimulus);

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
	}, [isPaused, exerciseCompleted]);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	const incrementStimulusCount = (stimulus: ShapeStimulus[]) => {
		const shapeCounts = new Map<string, number>();
		stimulus.forEach((shape) => {
			shapeCounts.set(shape.type, (shapeCounts.get(shape.type) || 0) + 1);
		});

		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			shapeCounts.forEach((count, type) => {
				newMap.set(type, (newMap.get(type) || 0) + count);
			});
			return newMap;
		});
	};

	const generateRandomStimulus = (): ShapeStimulus[] => {
		const shapeTemplates: ShapeStimulus[] = [
			{ type: "SQUARE", color: "#FF0000", icon: Square },
			{ type: "CIRCLE", color: "#FFFF00", icon: Circle },
			{ type: "TRIANGLE", color: "#00FF00", icon: Triangle },
			{ type: "DIAMOND", color: "#0000FF", icon: Diamond },
		];

		const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 shapes
		const selectedShapes = shapeTemplates.sort(() => 0.5 - Math.random()).slice(0, count);

		const expanded: ShapeStimulus[] = [];
		selectedShapes.forEach((shape) => {
			const shapeCount = Math.floor(Math.random() * 5) + 1; // 1–5 of each
			for (let i = 0; i < shapeCount; i++) {
				expanded.push({ ...shape });
			}
		});

		// Shuffle all shapes randomly
		for (let i = expanded.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[expanded[i], expanded[j]] = [expanded[j], expanded[i]];
		}

		return expanded;
	};

	const getProgressTableData = () => {
		return Array.from(stimulusCount.entries()).map(([shapeType, count]) => ({
			Shape: shapeType,
			Count: count,
		}));
	};

	const renderStimulus = () => {
		if (isWhiteScreen) return <View className="absolute inset-0 bg-white" />;

		if (!stimulus.length) return null;

		return (
			<View className="absolute inset-0 justify-center items-center bg-background-700 px-6">
				<View className="flex-row flex-wrap justify-center items-center gap-4 max-w-[90%]">
					{stimulus.map((shape, idx) => {
						const Icon = shape.icon;
						return <Icon key={idx} size={80} color={shape.color} fill={shape.color} />;
					})}
				</View>
			</View>
		);
	};

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
				rowData={getProgressTableData()}
				tableHeadKeys={["exerciseProgress.shape", "exerciseProgress.count"]}
			/>
		);
	}

	return (
		<>
			{renderStimulus()}
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
