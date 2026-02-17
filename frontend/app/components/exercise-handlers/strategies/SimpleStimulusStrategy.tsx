import React from "react";
import { View, Text, Dimensions } from "react-native";
import { Square, Triangle, Circle, Diamond } from "lucide-react-native";
import { Exercise } from "@/store/data/dataSlice";
import { Letter, NumberEnum } from "../../../data/program/Program";
import { StimulusStrategy } from "../UnifiedStimulus";

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

export const SimpleStimulusStrategy: StimulusStrategy = {
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

		if (!options.length) {
			return null;
		}

		const type = options[Math.floor(Math.random() * options.length)];
		const pool = params[type as keyof typeof params] || [];
		return pool[Math.floor(Math.random() * pool.length)];
	},

	renderStimulus: (stimulus: any, isWhiteScreen: boolean) => {
		if (isWhiteScreen) {
			return <View className="absolute inset-0 bg-white" />;
		}

		if (!stimulus) {
			return null;
		}

		const { width, height } = Dimensions.get("window");
		const minDim = Math.min(width, height);

		if (typeof stimulus === "object" && "hexcode" in stimulus) {
			return <View className="absolute inset-0" style={{ backgroundColor: stimulus.hexcode }} />;
		} else if (typeof stimulus === "string" && ["SQUARE", "TRIANGLE", "CIRCLE", "DIAMOND"].includes(stimulus)) {
			const { icon: Icon, color } = getIconForShape(stimulus);
			const size = Math.min(420, Math.floor(minDim * 0.85));
			return (
				<View className="absolute inset-0 justify-center items-center bg-background-700">
					<Icon size={size} color={color} fill={color} />
				</View>
			);
		} else if (Object.values(Letter).includes(stimulus) || Object.values(NumberEnum).includes(stimulus)) {
			const fontSize = Math.min(420, Math.floor(minDim * 0.6));
			return (
				<View className="absolute inset-0 justify-center items-center bg-background-700">
					<Text style={{ fontSize }} className="text-typography-950 font-bold">
						{stimulus}
					</Text>
				</View>
			);
		}

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
		setStimulusCount: React.Dispatch<React.SetStateAction<Map<string, number>>>
	) => {
		const key = typeof stimulus === "object" ? JSON.stringify(stimulus) : String(stimulus);
		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, (newMap.get(key) || 0) + 1);
			return newMap;
		});
	},
};
