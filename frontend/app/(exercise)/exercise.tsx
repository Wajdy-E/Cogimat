// app/exercise.tsx
import { useLocalSearchParams } from "expo-router";
import { Exercise } from "../../store/data/dataSlice";
import { Text } from "@/components/ui/text";
import SimpleStimulus from "../../components/exercise-handlers/SimpleStimulus";
import MathStimulus from "../../components/exercise-handlers/MathStimulus";
import MathOnlyStimulus from "../../components/exercise-handlers/MathOnlyStimulus";
import ShapeCountStimulus from "../../components/exercise-handlers/ShapeCountStimulus";
import { View } from "react-native";
import Countdown from "../../components/Countdown";
import { useState } from "react";
const handlerMap: Record<string, React.FC<{ exercise: Exercise }>> = {
	default: SimpleStimulus,
	"letter-sequence": SimpleStimulus,
	"shape-color-combo": SimpleStimulus,
	"math-combo": MathStimulus,
	"math-only": MathOnlyStimulus,
	//"memory-game": MemoryGame,
};

export default function ExerciseRouter() {
	const params = useLocalSearchParams();
	const [showCountdown, setShowCountdown] = useState(true);

	let exercise: Exercise | undefined;
	try {
		exercise = params?.data ? JSON.parse(params.data as string) : undefined;
	} catch {
		exercise = undefined;
	}

	if (!exercise) return <Text>Invalid or missing exercise</Text>;

	const Component = handlerMap[exercise.type] || handlerMap.default;

	return (
		<View className="absolute inset-0">
			{showCountdown && <Countdown seconds={5} isVisible onComplete={() => setShowCountdown(false)} />}
			{!showCountdown && <Component exercise={exercise} />}
		</View>
	);
}
