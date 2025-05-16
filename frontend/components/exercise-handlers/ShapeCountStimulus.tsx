// components/exerciseHandlers/ShapeCountStimulus.tsx

import { useEffect, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Square, Circle, Triangle, Diamond, Play, Pause, X } from "lucide-react-native";
import { Exercise } from "../../store/data/dataSlice";
import Countdown from "../Countdown";

interface ShapeOption {
	type: "SQUARE" | "CIRCLE" | "TRIANGLE" | "DIAMOND";
	color: string;
	icon: any;
}

export default function ShapeCountStimulus({ exercise }: { exercise: Exercise }) {
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [stimulus, setStimulus] = useState<ShapeOption[]>([]);
	const [timeLeft, setTimeLeft] = useState(parseInt(exercise.timeToComplete) || 60);

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
				setStimulus(generateRandomStimulus());
				await delay(onScreenTime * 1000);

				setIsWhiteScreen(true);
				await delay(offScreenTime * 1000);

				elapsed += onScreenTime + offScreenTime;
				setTimeLeft((prev) => Math.max(prev - (onScreenTime + offScreenTime), 0));
			}
		};

		runCycle();

		return () => {
			active = false;
		};
	}, [isPaused]);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	const generateRandomStimulus = (): ShapeOption[] => {
		const shapeTemplates: ShapeOption[] = [
			{ type: "SQUARE", color: "#FF0000", icon: Square },
			{ type: "CIRCLE", color: "#FFFF00", icon: Circle },
			{ type: "TRIANGLE", color: "#00FF00", icon: Triangle },
			{ type: "DIAMOND", color: "#0000FF", icon: Diamond },
		];

		const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 shapes
		const selectedShapes = shapeTemplates.sort(() => 0.5 - Math.random()).slice(0, count);

		const expanded: ShapeOption[] = [];
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

	const renderStimulus = () => {
		if (isWhiteScreen) {
			return (
				<View className="absolute inset-0" style={{ backgroundColor: exercise.customizableOptions?.offScreenColor }} />
			);
		}

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
					setStimulus([]);
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
