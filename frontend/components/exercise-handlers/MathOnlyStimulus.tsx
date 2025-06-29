// components/exerciseHandlers/MathOnlyStimulus.tsx

import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Exercise } from "../../store/data/dataSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { updateUserMilestone } from "../../store/auth/authSaga";
import ExerciseControl from "../exercises/ExerciseControl";
import ExerciseProgress from "../exercises/ExerciseProgress";

export default function MathOnlyStimulus({
	exercise,
	onComplete,
	onStop,
}: {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
}) {
	const dispatch = useDispatch<AppDispatch>();
	const [problem, setProblem] = useState<string | null>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [problemCount, setProblemCount] = useState<Map<string, number>>(new Map());
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
				const newProblem = generateValidMathProblem();
				setProblem(newProblem);
				incrementProblemCount(newProblem);

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

	const incrementProblemCount = (problem: string) => {
		setProblemCount((prev) => {
			const newMap = new Map(prev);
			newMap.set(problem, (newMap.get(problem) || 0) + 1);
			return newMap;
		});
	};

	const generateValidMathProblem = (): string => {
		while (true) {
			const operations = ["+", "-", "x", "/"];
			const op = operations[Math.floor(Math.random() * operations.length)];

			let a = 1 + Math.floor(Math.random() * 4);
			let b = 1 + Math.floor(Math.random() * 4);

			let result: number = 0;
			let problem: string;

			switch (op) {
				case "+":
					result = a + b;
					problem = `${a} + ${b}`;
					break;
				case "-":
					[a, b] = a >= b ? [a, b] : [b, a];
					result = a - b;
					problem = `${a} - ${b}`;
					break;
				case "x":
					result = a * b;
					problem = `${a} x ${b}`;
					break;
				case "/":
					result = a;
					problem = `${a * b} / ${b}`;
					break;
			}

			if (result >= 1 && result <= 4) return problem!;
		}
	};

	const getProgressTableData = () => {
		return Array.from(problemCount.entries()).map(([problem, count]) => ({
			Problem: problem,
			Count: count,
		}));
	};

	const renderStimulus = () => {
		if (isWhiteScreen) return <View className="absolute inset-0 bg-white" />;

		if (!problem) return null;

		return (
			<View className="absolute inset-0 justify-center items-center bg-background-700">
				<Text style={{ fontSize: 150 }} className="text-typography-950 font-bold">
					{problem}
				</Text>
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
				repsCompleted={Array.from(problemCount.values()).reduce((a, b) => a + b, 0)}
				totalTime={timeCompleted}
				onEnd={onComplete || (() => {})}
				onRestart={() => {
					setExerciseCompleted(false);
					setTimeCompleted(0);
					setProblemCount(new Map());
					setTimeLeft(totalDuration);
					setIsPaused(false);
				}}
				rowData={getProgressTableData()}
				tableHeadKeys={["exerciseProgress.problem", "exerciseProgress.count"]}
			/>
		);
	}

	return (
		<>
			{renderStimulus()}
			<ExerciseControl
				isPaused={isPaused}
				setStimulus={setProblem}
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
