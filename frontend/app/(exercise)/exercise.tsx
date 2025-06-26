// app/exercise.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { Exercise } from "../../store/data/dataSlice";
import { Text } from "@/components/ui/text";
import SimpleStimulus from "../../components/exercise-handlers/SimpleStimulus";
import MathStimulus from "../../components/exercise-handlers/MathStimulus";
import MathOnlyStimulus from "../../components/exercise-handlers/MathOnlyStimulus";
import ShapeCountStimulus from "../../components/exercise-handlers/ShapeCountStimulus";
import { View } from "react-native";
import Countdown from "../../components/Countdown";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { setCurrentExercise } from "../../store/data/dataSlice";

const handlerMap: Record<string, React.FC<{ exercise: Exercise; onComplete?: () => void }>> = {
	default: SimpleStimulus,
	"letter-sequence": SimpleStimulus,
	"shape-color-combo": SimpleStimulus,
	"math-combo": MathStimulus,
	"math-only": MathOnlyStimulus,
	//"memory-game": MemoryGame,
};

export default function ExerciseRouter() {
	const params = useLocalSearchParams();
	const router = useRouter();
	const dispatch: AppDispatch = useDispatch();
	const [showCountdown, setShowCountdown] = useState(true);

	// Check if this is routine mode
	const isRoutineMode = params?.routineMode === "true";
	const routineId = params?.routineId;
	const exerciseIndex = params?.exerciseIndex;

	let exercise: Exercise | undefined;
	try {
		exercise = params?.data ? JSON.parse(params.data as string) : undefined;
	} catch {
		exercise = undefined;
	}

	// Set the current exercise in Redux state
	useEffect(() => {
		if (exercise) {
			dispatch(setCurrentExercise(exercise));
		}
	}, [exercise, dispatch]);

	// Cleanup: clear selected exercise when component unmounts
	useEffect(() => {
		return () => {
			// Clear the selected exercise when leaving the screen
			dispatch(setCurrentExercise(null as any));
		};
	}, [dispatch]);

	if (!exercise) return <Text>Invalid or missing exercise</Text>;

	const Component = handlerMap[exercise.type] || handlerMap.default;

	const handleExerciseComplete = () => {
		console.log("isRoutineMode", isRoutineMode, routineId, exercise);
		if (isRoutineMode && routineId && exercise) {
			// Navigate back to routine execution screen with completion info
			console.log("pushing to routine execution");
			router.push(
				`/(tabs)/routine-execution?routineId=${routineId}&returnFromExercise=true&completedExerciseId=${exercise.id}`
			);
		} else {
			// Normal exercise completion - go back to previous screen
			router.back();
		}
	};

	return (
		<View className="absolute inset-0">
			{showCountdown && <Countdown seconds={5} isVisible={showCountdown} onComplete={() => setShowCountdown(false)} />}
			{!showCountdown && <Component exercise={exercise} onComplete={handleExerciseComplete} />}
		</View>
	);
}
