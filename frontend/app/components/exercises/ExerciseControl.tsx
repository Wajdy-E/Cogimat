import { Pause, Play, X, Settings } from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View, Text, Modal } from "react-native";
import MetronomeService from "@/services/MetronomeService";
import MetronomeControl, { MetronomeSettings } from "@/components/MetronomeControl";
import { Button, ButtonText } from "@/components/ui/button";
import { setExerciseStopped } from "@/store/data/dataSlice";
import { useDispatch } from "react-redux";

interface ExerciseControlProps {
	setStimulus: (stimulus: any) => void;
	setIsWhiteScreen: (isWhiteScreen: boolean) => void;
	setIsPaused: (isPaused: boolean) => void;
	totalDuration: number;
	isPaused: boolean;
	setTimeLeft: (timeLeft: number) => void;
	timeLeft: number;
	onStop?: () => void;
	exerciseId?: number;
	metronomeSettings?: MetronomeSettings;
	onMetronomeChange?: (settings: MetronomeSettings) => void;
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
	exerciseId,
	metronomeSettings = { enabled: false, bpm: 120 },
	onMetronomeChange,
}: ExerciseControlProps) {
	const [showSettings, setShowSettings] = useState(false);
	const dispatch = useDispatch();
	const handleSettingsClick = () => {
		// Stop metronome tick and show settings modal
		MetronomeService.pause();
		setShowSettings(true);
	};

	const handleCloseSettings = () => {
		setShowSettings(false);
	};

	const handlePauseClick = () => {
		setIsPaused(!isPaused);
		if (!isPaused) {
			dispatch(setExerciseStopped(true));
		}
		if (isPaused && metronomeSettings.enabled) {
			MetronomeService.start({
				bpm: metronomeSettings.bpm,
				soundId: metronomeSettings.soundId ?? "tick",
			});
		}
	};
	return (
		<>
			<View className="bg-gray-800 rounded-full absolute px-10 py-3 right-5 top-5">
				<Text className="text-white text-xl font-bold">{Math.ceil(timeLeft)}s</Text>
			</View>
			<TouchableOpacity
				className="bg-primary-500 p-4 rounded-full absolute bottom-5 left-5"
				onPress={handlePauseClick}
			>
				{isPaused ? <Play size={30} color="white" /> : <Pause size={30} color="white" />}
			</TouchableOpacity>
			{isPaused && (
				<>
					<TouchableOpacity
						className="bg-blue-600 p-4 rounded-full absolute bottom-5 right-5"
						onPress={handleSettingsClick}
					>
						<Settings size={30} color="white" />
					</TouchableOpacity>
					<TouchableOpacity
						className="bg-red-600 p-4 rounded-full absolute bottom-5"
						style={{ right: 90 }}
						onPress={() => {
							if (onStop) {
								onStop();
							} else {
								// Fallback behavior
								setStimulus(null);
								setIsWhiteScreen(false);
								setIsPaused(false);
								setTimeLeft(totalDuration);
								if (metronomeSettings.enabled) {
									MetronomeService.stop();
								}
							}
						}}
					>
						<X size={30} color="white" />
					</TouchableOpacity>
				</>
			)}
			{!isPaused && (
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

			<Modal visible={showSettings} transparent animationType="fade">
				<View className="flex-1 bg-black/70 justify-center items-center p-5">
					<View className="bg-background-800 rounded-xl p-6 w-full max-w-md">
						<MetronomeControl
							settings={metronomeSettings}
							onChange={(newSettings) => {
								if (onMetronomeChange) {
									onMetronomeChange(newSettings);
								}
							}}
							showVisualIndicator={false}
						/>
						<Button onPress={handleCloseSettings} action="primary" size="lg" className="w-full mt-6">
							<ButtonText>Close</ButtonText>
						</Button>
					</View>
				</View>
			</Modal>
		</>
	);
}

export default ExerciseControl;
