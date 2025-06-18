import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import Countdown from "../../components/Countdown";
import { Letter, NumberEnum } from "../../data/program/Program";
import { LucideIcon, Pause, Play, X, Square, Triangle, Circle, Diamond, Icon } from "lucide-react-native";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Icon as GlueStackIcon } from "@/components/ui/icon";
import { CustomExercise } from "../../store/data/dataSlice";
import { updateUserMilestone } from "../../store/auth/authSaga";

interface IconWithColor {
	icon: LucideIcon;
	color: string;
}

function ExerciseScreen() {
	const dispatch = useDispatch<AppDispatch>();
	const currentExercise = useSelector((state: RootState) => state.data.selectedExercise) as CustomExercise;

	if (!currentExercise) return null;

	const [showCountdown, setShowCountdown] = useState(true);
	const [stimulus, setStimulus] = useState<any>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [timeLeft, setTimeLeft] = useState(currentExercise?.customizableOptions.exerciseTime * 60 || 60);
	const [isPaused, setIsPaused] = useState(false);
	const [exerciseCompleted, setExerciseCompleted] = useState(false);
	const timeToComplete = currentExercise?.customizableOptions.exerciseTime * 60 || 60;
	const shapes = ["SQUARE", "CIRCLE", "TRIANGLE", "DIAMOND"];

	// Get customized timing settings
	const onScreenTime = currentExercise?.customizableOptions.onScreenTime || 1; // Already in seconds
	const offScreenTime = (currentExercise?.customizableOptions.offScreenTime || 0.5) * 1000; // Convert seconds to milliseconds
	const cycleTime = onScreenTime + offScreenTime / 1000; // Total cycle time in seconds

	useEffect(() => {
		if (showCountdown || !currentExercise || !currentExercise.parameters) return;

		setStimulus(getRandomStimulus());

		let elapsedTime = 0;
		const interval = setInterval(
			() => {
				if (elapsedTime >= timeToComplete * 1000 || isPaused) return;

				setIsWhiteScreen(true);
				setTimeout(() => {
					setStimulus(getRandomStimulus());
					setIsWhiteScreen(false);
				}, offScreenTime);

				elapsedTime += (onScreenTime + offScreenTime / 1000) * 1000; // Full cycle in milliseconds
				setTimeLeft((prev) => Math.max(prev - cycleTime, 0));

				// Exercise completed
				if (elapsedTime >= timeToComplete * 1000 && !exerciseCompleted) {
					setExerciseCompleted(true);
					// Update milestones for custom exercise completion
					dispatch(
						updateUserMilestone({
							milestoneType: "customExercisesCompleted",
							exerciseDifficulty: currentExercise.difficulty,
						})
					);
				}
			},
			(onScreenTime + offScreenTime / 1000) * 1000
		);

		return () => clearInterval(interval);
	}, [showCountdown, isPaused, currentExercise, exerciseCompleted, onScreenTime, offScreenTime, cycleTime]);

	const getRandomStimulus = () => {
		const params = currentExercise.parameters;
		if (!params) return null;

		const availableTypes = [];
		if (params.shapes?.length) availableTypes.push("shapes");
		if (params.colors?.length) availableTypes.push("colors");
		if (params.letters?.length) availableTypes.push("letters");
		if (params.numbers?.length) availableTypes.push("numbers");

		if (!availableTypes.length) return null;

		const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

		switch (randomType) {
			case "shapes":
				return params.shapes?.[Math.floor(Math.random() * params.shapes.length)];
			case "colors":
				return params.colors?.[Math.floor(Math.random() * params.colors.length)];
			case "letters":
				return params.letters?.[Math.floor(Math.random() * params.letters.length)];
			case "numbers":
				return params.numbers?.[Math.floor(Math.random() * params.numbers.length)];
			default:
				return null;
		}
	};

	const getIconForShape = (shapeName: string): IconWithColor => {
		switch (shapeName.toUpperCase()) {
			case "SQUARE":
				return { icon: Square, color: "#FF0000" };
			case "TRIANGLE":
				return { icon: Triangle, color: "#00FF00" };
			case "CIRCLE":
				return { icon: Circle, color: "#FFFF00" };
			case "DIAMOND":
				return { icon: Diamond, color: "#0000FF" };
			default:
				return { icon: Square, color: "#FFFFFF" };
		}
	};

	const renderStimulus = () => {
		if (isWhiteScreen) {
			// Use customized off screen color
			const offScreenColor = currentExercise?.customizableOptions.offScreenColor || "#FFFFFF";
			return <View className="absolute inset-0" style={{ backgroundColor: offScreenColor }} />;
		}
		if (!stimulus) return null;

		if (typeof stimulus === "object" && "hexcode" in stimulus) {
			return <View className="absolute inset-0" style={{ backgroundColor: stimulus.hexcode }} />;
		} else if (shapes.includes(stimulus)) {
			const { icon: Icon, color } = getIconForShape(stimulus);
			// Use customized on screen color for background
			const onScreenColor = currentExercise?.customizableOptions.onScreenColor || "#1F2937";
			return (
				<View className="flex justify-center absolute inset-0 items-center" style={{ backgroundColor: onScreenColor }}>
					<Icon size={250} color={color} fill={color} />
				</View>
			);
		} else if (Object.values(Letter).includes(stimulus)) {
			// Use customized on screen color for background
			const onScreenColor = currentExercise?.customizableOptions.onScreenColor || "#1F2937";
			return (
				<View className="flex justify-center absolute inset-0 items-center" style={{ backgroundColor: onScreenColor }}>
					<Text className="text-typography-950 font-bold" style={{ fontSize: 250 }}>
						{stimulus}
					</Text>
				</View>
			);
		} else if (Object.values(NumberEnum).includes(stimulus)) {
			// Use customized on screen color for background
			const onScreenColor = currentExercise?.customizableOptions.onScreenColor || "#1F2937";
			return (
				<View className="flex justify-center absolute inset-0 items-center" style={{ backgroundColor: onScreenColor }}>
					<Text className="text-typography-950 font-bold" style={{ fontSize: 250 }}>
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
				<Countdown
					isVisible={showCountdown}
					seconds={5}
					onComplete={() => {
						setShowCountdown(false);
					}}
				/>
			) : (
				<>
					{renderStimulus()}

					<View className="bg-gray-800 rounded-full absolute px-10 py-3 right-5 top-5">
						<Text className="text-white text-xl font-bold">{Math.ceil(timeLeft)}s</Text>
					</View>

					<Button
						className="rounded-full absolute bottom-5 left-5"
						onPress={() => setIsPaused((prev) => !prev)}
						action="primary"
					>
						{isPaused ? <GlueStackIcon as={Play} size="xl" /> : <ButtonIcon as={Pause} size="xl" />}
					</Button>

					<TouchableOpacity
						className="bg-red-600 p-4 rounded-full absolute bottom-5 right-5"
						onPress={() => {
							setStimulus(null);
							setIsWhiteScreen(false);
							setIsPaused(false);
							setTimeLeft(timeToComplete);
						}}
					>
						<X size={30} color="white" />
					</TouchableOpacity>
				</>
			)}
		</View>
	);
}

export default ExerciseScreen;
