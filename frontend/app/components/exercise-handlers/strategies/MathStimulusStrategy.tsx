import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Square, Triangle, Circle, Diamond } from "lucide-react-native";
import { Letter, NumberEnum } from "../../../data/program/Program";
import { StimulusStrategy } from "../UnifiedStimulus";
import { Exercise } from "@/store/data/dataSlice";

interface IconWithColor {
	icon: any;
	color: string;
}

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

		if (result >= 1 && result <= 4) {
			return problem!;
		}
	}
};

export const MathStimulusStrategy: StimulusStrategy = {
	generateStimulus: (exercise: Exercise) => {
		const custom = exercise.customizableOptions;
		const params = custom?.parameters ?? exercise.parameters;
		const options = [];

		if (params.shapes?.length) {
			options.push("shapes");
		}
		if (params.colors?.length) {
			options.push("colors");
		}
		if (params.letters?.length) {
			options.push("letters");
		}
		if (params.numbers?.length) {
			options.push("numbers");
		}
		options.push("math");

		const type = options[Math.floor(Math.random() * options.length)];

		let result: any;
		if (type === "math") {
			result = generateValidMathProblem();
		} else {
			const pool = params[type as keyof typeof params] || [];
			result = pool[Math.floor(Math.random() * pool.length)];
		}
		console.log("[MathStimulus] generateStimulus:", { type, result, options });
		return result;
	},

	renderStimulus: (stimulus: any, isWhiteScreen: boolean) => {
		if (isWhiteScreen) {
			return <View className="absolute inset-0 bg-white" />;
		}

		if (!stimulus) {
			return null;
		}

		if (typeof stimulus === "object" && "hexcode" in stimulus) {
			return <View className="absolute inset-0" style={{ backgroundColor: stimulus.hexcode }} />;
		} else if (typeof stimulus === "string" || typeof stimulus === "number") {
			const displayValue = String(stimulus);
			if (["SQUARE", "TRIANGLE", "CIRCLE", "DIAMOND"].includes(displayValue)) {
				const { icon: Icon, color } = getIconForShape(displayValue);
				const { width, height } = Dimensions.get("window");
				const minDim = Math.min(width, height);
				const iconSize = Math.min(420, Math.floor(minDim * 0.85));
				return (
					<View className="absolute inset-0 justify-center items-center bg-background-700">
						<Icon size={iconSize} color={color} fill={color} />
					</View>
				);
			} else if (
				(typeof stimulus === "string" && Object.values(Letter).includes(stimulus as Letter)) ||
				Object.values(NumberEnum).includes(stimulus) ||
				(typeof stimulus === "string" &&
					(stimulus.includes("+") || stimulus.includes("-") || stimulus.includes("x") || stimulus.includes("/")))
			) {
				const { width, height } = Dimensions.get("window");
				const minDim = Math.min(width, height);
				const isSingular =
					Object.values(NumberEnum).includes(stimulus) ||
					(typeof stimulus === "string" && Object.values(Letter).includes(stimulus as Letter));
				const fontSize = isSingular
					? Math.min(600, Math.floor(minDim * 0.92))
					: Math.min(420, Math.floor(minDim * 0.6));
				return (
					<View className="absolute inset-0 justify-center items-center bg-background-700 px-8">
						<Text
							style={{ fontSize, textAlign: "center", maxWidth: minDim * 0.9 }}
							className="text-typography-950 font-bold"
						>
							{displayValue}
						</Text>
					</View>
				);
			}
		}

		console.warn("[MathStimulus] Returning null - stimulus did not match any branch:", stimulus);
		return null;
	},

	getProgressData: (stimulusCount: Map<string, number>) => {
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
	},

	getTableHeaders: () => ["exerciseProgress.stimulus", "exerciseProgress.count"],

	incrementStimulusCount: (
		stimulus: any,
		setStimulusCount: React.Dispatch<React.SetStateAction<Map<string, number>>>,
	) => {
		const key = typeof stimulus === "object" ? JSON.stringify(stimulus) : String(stimulus);
		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, (newMap.get(key) || 0) + 1);
			return newMap;
		});
	},
};
