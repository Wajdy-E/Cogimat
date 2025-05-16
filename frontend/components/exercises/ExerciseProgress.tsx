import { Box } from "@/components/ui/box";
import CustomTable, { TableProps } from "../CustomTable";
import { View } from "react-native";

interface ExerciseProgressProps {
	repsCompleted: number;
	totalTime: number;
	onEnd: () => void;
	onRestart: () => void;
}

function ExerciseProgress(props: ExerciseProgressProps & TableProps) {
	return (
		<View className="absolute inset-0 bg-background-700">
			<View className="w-[90%] self-center">
				<CustomTable
					rowData={props.rowData}
					tableHeadKeys={props.tableHeadKeys}
					caption={`Progress: ${props.repsCompleted} reps completed`}
				/>
			</View>
		</View>
	);
}

export default ExerciseProgress;
