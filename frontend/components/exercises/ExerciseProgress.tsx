import { Box } from "@/components/ui/box";
import CustomTable, { TableProps } from "../CustomTable";
import { View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { i18n } from "../../i18n";

interface ExerciseProgressProps {
	repsCompleted: number;
	totalTime: number;
	onEnd: () => void;
	onRestart: () => void;
}

function ExerciseProgress(props: ExerciseProgressProps & TableProps) {
	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	return (
		<View className="absolute inset-0 bg-background-700">
			<VStack space="xl" className="flex-1 justify-center items-center p-4">
				<Box className="w-full max-w-md">
					<CustomTable
						rowData={props.rowData}
						tableHeadKeys={props.tableHeadKeys}
						caption={i18n.t("exerciseProgress.caption", {
							reps: props.repsCompleted,
							time: formatTime(props.totalTime),
						})}
					/>
				</Box>

				<VStack space="md" className="w-full max-w-md">
					<Button size="lg" onPress={props.onEnd} action="primary">
						<ButtonText>{i18n.t("general.buttons.done")}</ButtonText>
					</Button>
					<Button size="lg" variant="outline" onPress={props.onRestart}>
						<ButtonText>{i18n.t("general.buttons.restart")}</ButtonText>
					</Button>
				</VStack>
			</VStack>
		</View>
	);
}

export default ExerciseProgress;
