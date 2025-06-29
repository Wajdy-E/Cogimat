import { Pause, Play, X } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface ExerciseControlProps {
	setStimulus: (stimulus: any) => void;
	setIsWhiteScreen: (isWhiteScreen: boolean) => void;
	setIsPaused: (isPaused: boolean) => void;
	totalDuration: number;
	isPaused: boolean;
	setTimeLeft: (timeLeft: number) => void;
	timeLeft: number;
	onStop?: () => void;
}

function ExerciseControl({
	setStimulus,
	setIsWhiteScreen,
	setIsPaused,
	totalDuration,
	isPaused,
	setTimeLeft,
	timeLeft,
	onStop,
}: ExerciseControlProps) {
	return (
		<>
			<View className="bg-gray-800 rounded-full absolute px-10 py-3 right-5 top-5">
				<Text className="text-white text-xl font-bold">{Math.ceil(timeLeft)}s</Text>
			</View>
			<TouchableOpacity
				className="bg-primary-500 p-4 rounded-full absolute bottom-5 left-5"
				onPress={() => setIsPaused(!isPaused)}
			>
				{isPaused ? <Play size={30} color="white" /> : <Pause size={30} color="white" />}
			</TouchableOpacity>
			{isPaused && (
				<TouchableOpacity
					className="bg-red-600 p-4 rounded-full absolute bottom-5 right-5"
					onPress={() => {
						if (onStop) {
							onStop();
						} else {
							// Fallback behavior
							setStimulus(null);
							setIsWhiteScreen(false);
							setIsPaused(false);
							setTimeLeft(totalDuration);
						}
					}}
				>
					<X size={30} color="white" />
				</TouchableOpacity>
			)}
		</>
	);
}

export default ExerciseControl;
