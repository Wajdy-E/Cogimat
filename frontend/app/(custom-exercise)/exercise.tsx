import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import Countdown from "../../components/Countdown";
import { Letter, NumberEnum } from "../../data/program/Program";
import { LucideIcon, Square, Triangle, Circle, Diamond } from "lucide-react-native";
import { CustomExercise } from "../../store/data/dataSlice";
import { updateUserMilestone } from "../../store/auth/authSaga";
import ExerciseControl from "../../components/exercises/ExerciseControl";
import ExerciseProgress from "../../components/exercises/ExerciseProgress";
import { useLocalSearchParams, useRouter } from "expo-router";
import { setCurrentExercise } from "../../store/data/dataSlice";
import CustomExerciseHeader from "../../components/CustomExerciseHeader";

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

	const currentExercise = useSelector((state: RootState) => state.data.selectedExercise) as CustomExercise;

	// Set the current exercise in Redux state if not already set
	useEffect(() => {
		if (!currentExercise && params?.data) {
			try {
				const exerciseData = JSON.parse(params.data as string);
				dispatch(setCurrentExercise(exerciseData));
			} catch (error) {
				console.error("Error parsing exercise data:", error);
			}
		}
	}, [currentExercise, params?.data, dispatch]);

	// Cleanup: clear selected exercise when component unmounts
	useEffect(() => {
		return () => {
			// Clear the selected exercise when leaving the screen
			dispatch(setCurrentExercise(null as any));
		};
	}, [dispatch]);

	if (!currentExercise) return null;

	const [showCountdown, setShowCountdown] = useState(true);
	const [stimulus, setStimulus] = useState<any>(null);
	const [isWhiteScreen, setIsWhiteScreen] = useState(false);
	const [timeLeft, setTimeLeft] = useState(currentExercise?.customizableOptions.exerciseTime * 60 || 60);
	const [isPaused, setIsPaused] = useState(false);
	const [stimulusCount, setStimulusCount] = useState<Map<string, number>>(new Map());
	const [timeCompleted, setTimeCompleted] = useState(0);
	const [exerciseCompleted, setExerciseCompleted] = useState(false);
	const [exerciseStopped, setExerciseStopped] = useState(false);
	const timeToComplete = currentExercise?.customizableOptions.exerciseTime * 60 || 60;
	const shapes = ["SQUARE", "CIRCLE", "TRIANGLE", "DIAMOND"];

	// Get customized timing settings
	const onScreenTime = currentExercise?.customizableOptions.onScreenTime || 1; // Already in seconds
	const offScreenTime = (currentExercise?.customizableOptions.offScreenTime || 0.5) * 1000; // Convert seconds to milliseconds
	const cycleTime = onScreenTime + offScreenTime / 1000; // Total cycle time in seconds

	// Function to stop the exercise
	const handleStopExercise = () => {
		setExerciseStopped(true);
		setExerciseCompleted(true);
		setIsPaused(true);
		setShowCountdown(false);
		dispatch(setCurrentExercise(null));
	};

	// Function to handle manual stop from control
	const handleManualStop = () => {
		setExerciseStopped(true);
		setExerciseCompleted(true);
		setIsPaused(true);
		setShowCountdown(false);
	};

	// Independent timer effect
	useEffect(() => {
		if (showCountdown || exerciseCompleted) return;

		const timer = setInterval(() => {
			if (!isPaused && timeLeft > 0) {
				setTimeLeft((prev) => {
					const newTime = prev - 1;
					if (newTime <= 0) {
						setExerciseCompleted(true);
						// Update milestones for custom exercise completion
						dispatch(
							updateUserMilestone({
								milestoneType: "customExercisesCompleted",
								exerciseDifficulty: currentExercise.difficulty,
							})
						);
					}
					return Math.max(newTime, 0);
				});
				setTimeCompleted((prev) => prev + 1);
			}
		}, 1000);

		return () => clearInterval(timer);
	}, [showCountdown, isPaused, timeLeft, exerciseCompleted, dispatch, currentExercise.difficulty]);

	// Stimulus cycle effect
	useEffect(() => {
		if (showCountdown || !currentExercise || !currentExercise.parameters || exerciseCompleted) return;

		setStimulus(getRandomStimulus());

		let elapsedTime = 0;
		const interval = setInterval(
			() => {
				if (elapsedTime >= timeToComplete * 1000 || isPaused || exerciseCompleted) return;

				setIsWhiteScreen(true);
				setTimeout(() => {
					const newStimulus = getRandomStimulus();
					setStimulus(newStimulus);
					incrementStimulusCount(newStimulus);
					setIsWhiteScreen(false);
				}, offScreenTime);

				elapsedTime += (onScreenTime + offScreenTime / 1000) * 1000; // Full cycle in milliseconds
			},
			(onScreenTime + offScreenTime / 1000) * 1000
		);

		return () => clearInterval(interval);
	}, [showCountdown, isPaused, currentExercise, exerciseCompleted, onScreenTime, offScreenTime, cycleTime]);

	const incrementStimulusCount = (stimulus: any) => {
		const key = typeof stimulus === "object" ? JSON.stringify(stimulus) : String(stimulus);
		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			newMap.set(key, (newMap.get(key) || 0) + 1);
			return newMap;
		});
	};

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
		if (isRoutineMode && routineId) {
			// Navigate back to routine execution screen
			router.push(`/(tabs)/routine-execution?routineId=${routineId}`);
		} else {
			// Check if this is a community exercise by looking for the id parameter
			// Community exercises are routed with ?id= parameter, custom exercises use data parameter
			if (params?.id) {
				// This is a community exercise, route back to community exercise page
				router.push(`/(community-exercise)/${params.id}`);
			} else {
				// This is a custom exercise, route back to custom exercise page
				router.push(`/(custom-exercise)/${currentExercise.id}`);
			}
		}
	};

	const renderStimulus = () => {
		if (isWhiteScreen) {
			// Use default white background
			return <View className="absolute inset-0 bg-white" />;
		}
		if (!stimulus) return null;

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
						setExerciseStopped(false);
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
