import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import Countdown from "../../components/Countdown";
import { Letter, NumberEnum, colorOptions, ColorOption } from "../../data/program/Program";
import { LucideIcon, Square, Triangle, Circle, Diamond } from "lucide-react-native";
import { CustomExercise } from "../../store/data/dataSlice";
import { updateUserMilestone } from "../../store/auth/authSaga";
import ExerciseControl from "../../components/exercises/ExerciseControl";
import ExerciseProgress from "../../components/exercises/ExerciseProgress";
import { useLocalSearchParams, useRouter } from "expo-router";
import { setCurrentExercise } from "../../store/data/dataSlice";
import CustomExerciseHeader from "../../components/CustomExerciseHeader";
import { i18n } from "../../i18n";

interface IconWithColor {
	icon: LucideIcon;
	color: string;
}

function ExerciseScreen() {
	const dispatch = useDispatch<AppDispatch>();
	const router = useRouter();
	const params = useLocalSearchParams();
	const isRoutineMode = params?.routineMode === "true";
	const routineId = params?.routineId;

	const currentExercise = useSelector((state: RootState) => state.data.selectedExercise) as CustomExercise; // Set the current exercise in Redux state if not already set

	const [showCountdown, setShowCountdown] = useState(true);
	const [stimulus, setStimulus] = useState<any>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [timeLeft, setTimeLeft] = useState(currentExercise?.customizableOptions.exerciseTime || 3600);
	const [isPaused, setIsPaused] = useState(false);
	const [stimulusCount, setStimulusCount] = useState<Map<string, number>>(new Map());
	const [timeCompleted, setTimeCompleted] = useState(0);
	const [exerciseCompleted, setExerciseCompleted] = useState(false);

	// Update timeLeft when currentExercise is loaded
	useEffect(() => {
		if (currentExercise?.customizableOptions?.exerciseTime) {
			setTimeLeft(currentExercise.customizableOptions.exerciseTime);
		}
	}, [currentExercise]);

	// Cleanup: clear selected exercise when component unmounts
	// Get customized timing settings
	const onScreenTime = currentExercise?.customizableOptions?.onScreenTime || 1; // Already in seconds
	const offScreenTime = currentExercise?.customizableOptions?.offScreenTime || 0.5; // Already in seconds
	useEffect(() => {
		return () => {
			// Clear the selected exercise when leaving the screen
			dispatch(setCurrentExercise(null));
		};
	}, [dispatch]);

	// Independent timer effect
	useEffect(() => {
		if (showCountdown || exerciseCompleted) {
			return;
		}
		const timer = setInterval(() => {
			if (!isPaused && timeLeft > 0) {
				setTimeLeft((prev) => {
					const newTime = prev - 1;
					if (newTime <= 0) {
						setExerciseCompleted(true);
						// Update milestones for custom exercise completion
						if (currentExercise) {
							dispatch(
								updateUserMilestone({
									milestoneType: "customExercisesCompleted",
									exerciseDifficulty: currentExercise.difficulty,
								})
							);
						}
					}
					return Math.max(newTime, 0);
				});
				setTimeCompleted((prev) => prev + 1);
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [showCountdown, isPaused, timeLeft, exerciseCompleted, dispatch, currentExercise?.difficulty]);

	// Stimulus cycle effect
	useEffect(() => {
		if (showCountdown || !currentExercise || !currentExercise.parameters || exerciseCompleted) {
			return;
		}

		let isActive = true;
		let currentCycle = 0;

		const runCycle = async () => {
			while (isActive && !isPaused && !exerciseCompleted) {
				// Show stimulus for onScreenTime
				setIsWhiteScreen(false);
				const newStimulus = getRandomStimulus();
				setStimulus(newStimulus);
				incrementStimulusCount(newStimulus);

				// Wait for onScreenTime
				await new Promise((resolve) => setTimeout(resolve, onScreenTime * 1000));

				if (!isActive || isPaused || exerciseCompleted) break;

				// Show white screen for offScreenTime
				setIsWhiteScreen(true);
				await new Promise((resolve) => setTimeout(resolve, offScreenTime * 1000));

				if (!isActive || isPaused || exerciseCompleted) break;

				currentCycle++;
			}
		};

		runCycle();

		return () => {
			isActive = false;
		};
	}, [showCountdown, isPaused, currentExercise, exerciseCompleted, onScreenTime, offScreenTime]);

	if (!currentExercise) {
		return (
			<View className="flex-1 justify-center items-center bg-background-700">
				<Text className="text-typography-950">{i18n.t("general.loading")}</Text>
			</View>
		);
	}
	const timeToComplete = currentExercise?.customizableOptions.exerciseTime || 3600;
	const shapes = ["SQUARE", "CIRCLE", "TRIANGLE", "DIAMOND"];

	// Function to stop the exercise
	const handleStopExercise = () => {
		setExerciseCompleted(true);
		setIsPaused(true);
		setShowCountdown(false);
		dispatch(setCurrentExercise(null));
	};

	// Function to handle manual stop from control
	const handleManualStop = () => {
		setExerciseCompleted(true);
		setIsPaused(true);
		setShowCountdown(false);
	};

	const incrementStimulusCount = (stimulus: any) => {
		const key = typeof stimulus === "object" ? JSON.stringify(stimulus) : String(stimulus);
		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, (newMap.get(key) || 0) + 1);
			return newMap;
		});
	};

	const getRandomStimulus = () => {
		if (!currentExercise) return null;

		const custom = currentExercise.customizableOptions;
		const params = custom?.parameters ?? currentExercise.parameters;
		if (!params) {
			return null;
		}

		const availableTypes = [];
		if (params.shapes?.length) {
			availableTypes.push("shapes");
		}
		if (params.colors?.length) {
			availableTypes.push("colors");
		}
		if (params.letters?.length) {
			availableTypes.push("letters");
		}
		if (params.numbers?.length) {
			availableTypes.push("numbers");
		}

		if (!availableTypes.length) {
			return null;
		}

		const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

		switch (randomType) {
			case "shapes":
				return params.shapes?.[Math.floor(Math.random() * params.shapes.length)];
			case "colors":
				const colorName = params.colors?.[Math.floor(Math.random() * params.colors.length)];
				// Convert color name to hexcode format
				if (colorName) {
					const colorOption = colorOptions.find((option: ColorOption) => option.name === colorName);
					return colorOption || { hexcode: "#FFFFFF", name: colorName };
				}
				return null;
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

	const handleExerciseEnd = () => {
		if (isRoutineMode && routineId && currentExercise) {
			// Navigate back to routine execution screen with completion parameters
			router.push(
				`/(tabs)/routine-execution?routineId=${routineId}&returnFromExercise=true&completedExerciseId=${currentExercise.id}`
			);
		} else {
			// Check if this is a community exercise by looking for the id parameter
			// Community exercises are routed with ?id= parameter, custom exercises use data parameter
			if (params?.id) {
				// This is a community exercise, route back to community exercise page
				router.push(`/(community-exercise)/${params.id}`);
			} else if (currentExercise) {
				// This is a custom exercise, route back to custom exercise page
				setExerciseCompleted(false);
				setTimeCompleted(0);
				setStimulusCount(new Map());
				setTimeLeft(currentExercise.customizableOptions.exerciseTime);
				setIsPaused(false);
				router.push(`/(custom-exercise)/${currentExercise.id}`);
			}
		}
	};

	const renderStimulus = () => {
		if (isWhiteScreen) {
			// Use default white background
			return <View className="absolute inset-0 bg-white" />;
		}
		if (!stimulus) {
			return null;
		}

		if (typeof stimulus === "object" && "hexcode" in stimulus) {
			return <View className="absolute inset-0" style={{ backgroundColor: stimulus.hexcode }} />;
		} else if (shapes.includes(stimulus)) {
			const { icon: Icon, color } = getIconForShape(stimulus);
			// Use default dark background
			return (
				<View className="flex justify-center absolute inset-0 items-center bg-background-700">
					<Icon size={250} color={color} fill={color} />
				</View>
			);
		} else if (Object.values(Letter).includes(stimulus)) {
			// Use default dark background
			return (
				<View className="flex justify-center absolute inset-0 items-center bg-background-700">
					<Text className="text-typography-950 font-bold" style={{ fontSize: 250 }}>
						{stimulus}
					</Text>
				</View>
			);
		} else if (Object.values(NumberEnum).includes(stimulus)) {
			// Use default dark background
			return (
				<View className="flex justify-center absolute inset-0 items-center bg-background-700">
					<Text className="text-typography-950 font-bold" style={{ fontSize: 250 }}>
						{stimulus}
					</Text>
				</View>
			);
		}

		return null;
	};

	if (exerciseCompleted) {
		return (
			<View className="flex-1">
				<CustomExerciseHeader showSettings={true} onBack={handleStopExercise} isExerciseActive={false} />
				<ExerciseProgress
					repsCompleted={Array.from(stimulusCount.values()).reduce((a, b) => a + b, 0)}
					totalTime={timeCompleted}
					onEnd={handleExerciseEnd}
					onRestart={() => {
						setExerciseCompleted(false);
						setTimeCompleted(0);
						setStimulusCount(new Map());
						setTimeLeft(timeToComplete);
						setIsPaused(false);
					}}
					rowData={getProgressTableData()}
					tableHeadKeys={["exerciseProgress.stimulus", "exerciseProgress.count"]}
					useAbsolutePositioning={true}
				/>
			</View>
		);
	}

	return (
		<View className="flex-1">
			<CustomExerciseHeader showSettings={true} onBack={handleStopExercise} isExerciseActive={!showCountdown} />
			<View className="flex-1">
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
						<ExerciseControl
							isPaused={isPaused}
							setStimulus={setStimulus}
							setIsWhiteScreen={setIsWhiteScreen}
							setIsPaused={setIsPaused}
							totalDuration={timeToComplete}
							setTimeLeft={setTimeLeft}
							timeLeft={timeLeft}
							onStop={handleManualStop}
						/>
					</>
				)}
			</View>
		</View>
	);
}

export default ExerciseScreen;
