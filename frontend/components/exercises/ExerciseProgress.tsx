import { Box } from "@/components/ui/box";
import CustomTable, { TableProps } from "../CustomTable";
import { ScrollView, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { i18n } from "../../i18n";
import { HStack } from "@/components/ui/hstack";

interface ExerciseProgressProps {
	repsCompleted: number;
	totalTime: number;
	onEnd: () => void;
	onRestart: () => void;
	useAbsolutePositioning?: boolean;
}

function ExerciseProgress(props: ExerciseProgressProps & TableProps) {
	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const containerClass = props.useAbsolutePositioning ? "bg-background-700" : "flex-1 bg-background-700";

	return (
		<ScrollView contentContainerStyle={{ paddingBottom: 200 }} className={containerClass}>
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

				<HStack space="md" className="w-full">
					<Button size="lg" onPress={props.onEnd} action="primary" className="flex-1">
						<ButtonText>{i18n.t("general.buttons.done")}</ButtonText>
					</Button>
					<Button size="lg" variant="outline" onPress={props.onRestart} className="flex-1">
						<ButtonText>{i18n.t("general.buttons.restart")}</ButtonText>
					</Button>
				</HStack>
			</VStack>
		</ScrollView>
	);
}

export default ExerciseProgress;
