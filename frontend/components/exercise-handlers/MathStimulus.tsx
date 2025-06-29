// components/exerciseHandlers/MathStimulus.tsx

import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Square, Triangle, Circle, Diamond } from "lucide-react-native";
import { Exercise } from "../../store/data/dataSlice";
import { Letter, NumberEnum } from "../../data/program/Program";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { updateUserMilestone } from "../../store/auth/authSaga";
import ExerciseControl from "../exercises/ExerciseControl";
import ExerciseProgress from "../exercises/ExerciseProgress";

interface IconWithColor {
	icon: any;
	color: string;
}

export default function MathStimulus({
	exercise,
	onComplete,
	onStop,
}: {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
}) {
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
				const newStimulus = getRandomStimulus();
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

	const incrementStimulusCount = (stimulus: any) => {
		const key = typeof stimulus === "object" ? JSON.stringify(stimulus) : String(stimulus);
		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, (newMap.get(key) || 0) + 1);
			return newMap;
		});
	};

	const getRandomStimulus = () => {
		const params = custom?.parameters ?? exercise.parameters;
		const options = [];

		if (params.shapes?.length) options.push("shapes");
		if (params.colors?.length) options.push("colors");
		if (params.letters?.length) options.push("letters");
		if (params.numbers?.length) options.push("numbers");
		options.push("math");

		const type = options[Math.floor(Math.random() * options.length)];

		if (type === "math") return generateValidMathProblem();

		const pool = params[type as keyof typeof params] || [];
		return pool[Math.floor(Math.random() * pool.length)];
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

	const getIconForShape = (shape: string): IconWithColor => {
		switch (shape.toUpperCase()) {
			case "SQUARE":
				return { icon: Square, color: "#FF0000" };
			case "TRIANGLE":
				return { icon: Triangle, color: "#00FF00" };
			case "CIRCLE":
				return { icon: Circle, color: "#FFFF00" };
			case "DIAMOND":
				return { icon: Diamond, color: "#0000FF" };
			default:
				return { icon: Square, color: "#CCCCCC" };
		}
	};

	const getProgressTableData = () => {
		return Array.from(stimulusCount.entries()).map(([stimulus, count]) => {
			let displayStimulus = stimulus;
			try {
				const parsed = JSON.parse(stimulus);
				if (parsed.hexcode) {
					displayStimulus = parsed.hexcode;
				}
			} catch {
				displayStimulus = stimulus;
			}
			return { Stimulus: displayStimulus, Count: count };
		});
	};

	const renderStimulus = () => {
		if (isWhiteScreen) return <View className="absolute inset-0 bg-white" />;

		if (!stimulus) return null;

		if (typeof stimulus === "object" && "hexcode" in stimulus) {
			return <View className="absolute inset-0" style={{ backgroundColor: stimulus.hexcode }} />;
		} else if (typeof stimulus === "string") {
			if (["SQUARE", "TRIANGLE", "CIRCLE", "DIAMOND"].includes(stimulus)) {
				const { icon: Icon, color } = getIconForShape(stimulus);
				return (
					<View className="absolute inset-0 justify-center items-center bg-background-700">
						<Icon size={250} color={color} fill={color} />
					</View>
				);
			} else if (
				Object.values(Letter).includes(stimulus as Letter) ||
				Object.values(NumberEnum).includes(stimulus) ||
				stimulus.includes("+") ||
				stimulus.includes("-") ||
				stimulus.includes("x") ||
				stimulus.includes("/")
			) {
				return (
					<View className="absolute inset-0 justify-center items-center bg-background-700">
						<Text style={{ fontSize: 150 }} className="text-typography-950 font-bold">
							{stimulus}
						</Text>
					</View>
				);
			}
		}

		return null;
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
				tableHeadKeys={["exerciseProgress.stimulus", "exerciseProgress.count"]}
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
