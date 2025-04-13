// app/exercise.tsx
import { useLocalSearchParams } from "expo-router";
import { Exercise } from "../../store/data/dataSlice";
import { Text } from "@/components/ui/text";
import SimpleStimulus from "../../components/exercise-handlers/SimpleStimulus";
const handlerMap: Record<string, React.FC<{ exercise: Exercise }>> = {
	default: SimpleStimulus,
	"letter-sequence": SimpleStimulus,
	"shape-color-combo": SimpleStimulus,
	//"memory-game": MemoryGame,
};

export default function ExerciseRouter() {
	const params = useLocalSearchParams();

	let exercise: Exercise | undefined;
	try {
		exercise = params?.data ? JSON.parse(params.data as string) : undefined;
	} catch {
		exercise = undefined;
	}

	if (!exercise) return <Text>Invalid or missing exercise</Text>;

	const Component = handlerMap[exercise.type] || handlerMap.default;

	return <Component exercise={exercise} />;
}
