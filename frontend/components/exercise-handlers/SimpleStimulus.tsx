// components/exerciseHandlers/SimpleStimulus.tsx

import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Icon as GlueIcon } from "@/components/ui/icon";
import { Square, Triangle, Circle, Diamond, Play, Pause, X } from "lucide-react-native";
import { Exercise } from "../../store/data/dataSlice";
import { Letter, NumberEnum } from "../../data/program/Program";
import Countdown from "../Countdown";

interface IconWithColor {
	icon: any;
	color: string;
}

export default function SimpleStimulus({ exercise }: { exercise: Exercise }) {
	const [showCountdown, setShowCountdown] = useState(true);
	const [stimulus, setStimulus] = useState<any>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [isPaused, setIsPaused] = useState(false);

	const custom = exercise.customizableOptions;

	const offScreenTime = custom?.offScreenTime ?? 0.5;
	const onScreenTime = custom?.onScreenTime ?? 1;
	const totalDuration = parseInt(exercise.timeToComplete) || 60;

	const [timeLeft, setTimeLeft] = useState(totalDuration);

	useEffect(() => {
		if (showCountdown) return;

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
		};

		runCycle();

		return () => {
			active = false;
		};
	}, [showCountdown, isPaused]);

	const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

	const getRandomStimulus = () => {
		const params = custom?.parameters ?? exercise.parameters;
		const options = [];

		if (params.shapes?.length) options.push("shapes");
		if (params.colors?.length) options.push("colors");
		if (params.letters?.length) options.push("letters");
		if (params.numbers?.length) options.push("numbers");

		if (!options.length) return null;

		const type = options[Math.floor(Math.random() * options.length)];
		const pool = params[type as keyof typeof params] || [];
		return pool[Math.floor(Math.random() * pool.length)];
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
		} else if (typeof stimulus === "string" && ["SQUARE", "TRIANGLE", "CIRCLE", "DIAMOND"].includes(stimulus)) {
			const { icon: Icon, color } = getIconForShape(stimulus);
			return (
				<View className="absolute inset-0 justify-center items-center bg-background-700">
					<Icon size={250} color={color} fill={color} />
				</View>
			);
		} else if (Object.values(Letter).includes(stimulus) || Object.values(NumberEnum).includes(stimulus)) {
			return (
				<View className="absolute inset-0 justify-center items-center bg-background-700">
					<Text style={{ fontSize: 250 }} className="text-typography-950 font-bold">
						{stimulus}
					</Text>
				</View>
			);
		}

		return null;
	};

	return (
		<View className="absolute inset-0">
			{showCountdown ? (
				<Countdown seconds={5} isVisible onComplete={() => setShowCountdown(false)} />
			) : (
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
							setShowCountdown(true);
						}}
					>
						<X size={30} color="white" />
					</TouchableOpacity>
				</>
			)}
		</View>
	);
}
