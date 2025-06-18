// components/exerciseHandlers/MathStimulus.tsx

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Play, Pause, X, Square, Triangle, Circle, Diamond } from "lucide-react-native";
import { Exercise } from "../../store/data/dataSlice";
import { Letter, NumberEnum } from "../../data/program/Program";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { updateUserMilestone } from "../../store/auth/authSaga";

interface IconWithColor {
	icon: any;
	color: string;
}

export default function MathStimulus({ exercise }: { exercise: Exercise }) {
	const dispatch = useDispatch<AppDispatch>();
	const [stimulus, setStimulus] = useState<any>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [timeLeft, setTimeLeft] = useState(parseInt(exercise.timeToComplete) || 60);
	const [exerciseCompleted, setExerciseCompleted] = useState(false);

	const custom = exercise.customizableOptions;
	const offScreenTime = custom?.offScreenTime ?? 0.5;
	const onScreenTime = custom?.onScreenTime ?? 1;
	const totalDuration = parseInt(exercise.timeToComplete) || 60;

	useEffect(() => {
		let elapsed = 0;
		let active = true;

		const runCycle = async () => {
			while (active && elapsed < totalDuration && !isPaused) {
				setIsWhiteScreen(false);
				setStimulus(getRandomStimulus());
				await delay(onScreenTime * 1000);

				setIsWhiteScreen(true);
				await delay(offScreenTime * 1000);

				elapsed += onScreenTime + offScreenTime;
				setTimeLeft((prev) => Math.max(prev - (onScreenTime + offScreenTime), 0));
			}

			// Exercise completed
			if (elapsed >= totalDuration && !exerciseCompleted) {
				setExerciseCompleted(true);
				// Update milestones
				dispatch(
					updateUserMilestone({
						milestoneType: "exercisesCompleted",
						exerciseDifficulty: exercise.difficulty,
					})
				);
			}
		};

		runCycle();
		return () => {
			active = false;
		};
	}, [isPaused, exerciseCompleted]);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

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

	const renderStimulus = () => {
		if (isWhiteScreen)
			return (
				<View className="absolute inset-0" style={{ backgroundColor: exercise.customizableOptions?.offScreenColor }} />
			);

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

	return (
		<>
			{renderStimulus()}

			<View className="bg-gray-800 rounded-full absolute px-10 py-3 right-5 top-5">
				<Text className="text-white text-xl font-bold">{Math.ceil(timeLeft)}s</Text>
			</View>

			<TouchableOpacity
				className="bg-primary-500 p-4 rounded-full absolute bottom-5 left-5"
				onPress={() => setIsPaused((prev) => !prev)}
			>
				{isPaused ? <Play size={30} color="black" /> : <Pause size={30} color="black" />}
			</TouchableOpacity>

			<TouchableOpacity
				className="bg-red-600 p-4 rounded-full absolute bottom-5 right-5"
				onPress={() => {
					setStimulus(null);
					setIsWhiteScreen(false);
					setIsPaused(false);
					setTimeLeft(totalDuration);
				}}
			>
				<X size={30} color="white" />
			</TouchableOpacity>
		</>
	);
}
