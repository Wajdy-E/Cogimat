import React from "react";
import { View, Text } from "react-native";
import { Exercise } from "../../../store/data/dataSlice";
import { StimulusStrategy } from "../UnifiedStimulus";

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

export const MathOnlyStimulusStrategy: StimulusStrategy = {
	generateStimulus: (exercise: Exercise) => {
		return generateValidMathProblem();
	},

	renderStimulus: (stimulus: any, isWhiteScreen: boolean) => {
		if (isWhiteScreen) return <View className="absolute inset-0 bg-white" />;

		if (!stimulus) return null;

		return (
			<View className="absolute inset-0 justify-center items-center bg-background-700">
				<Text style={{ fontSize: 150 }} className="text-typography-950 font-bold">
					{stimulus}
				</Text>
			</View>
		);
	},

	getProgressData: (stimulusCount: Map<string, number>) => {
		return Array.from(stimulusCount.entries()).map(([problem, count]) => ({
			Problem: problem,
			Count: count,
		}));
	},

	getTableHeaders: () => ["exerciseProgress.problem", "exerciseProgress.count"],

	incrementStimulusCount: (
		stimulus: any,
		setStimulusCount: React.Dispatch<React.SetStateAction<Map<string, number>>>
	) => {
		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			newMap.set(stimulus, (newMap.get(stimulus) || 0) + 1);
			return newMap;
		});
	},
};
