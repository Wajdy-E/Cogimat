import { View } from "react-native";
import { Exercise, ExerciseDifficulty, CustomExercise, getExerciseCustomizedOptions } from "@/store/data/dataSlice";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Clock, X } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonIcon } from "@/components/ui/button";
import { i18n } from "../i18n";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface RoutineExerciseCardProps {
	exercise: Exercise | CustomExercise;
	exerciseType: "standard" | "custom";
	onRemove?: () => void;
	classes?: string;
}

function RoutineExerciseCard(props: RoutineExerciseCardProps) {
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises);

	function getDifficultyBadgeColor() {
		switch (props.exercise.difficulty) {
			case ExerciseDifficulty.Beginner:
				return "success"; // Green for Easy/Beginner
			case ExerciseDifficulty.Intermediate:
				return "warning"; // Orange/Yellow for Medium/Intermediate
			case ExerciseDifficulty.Advanced:
				return "error"; // Orange/Red for Hard/Advanced
			default:
				return "muted";
		}
	}

	function getDifficultyLabel() {
		const difficulty = props.exercise.difficulty.toLowerCase();
		if (difficulty === "beginner") return "Easy";
		if (difficulty === "intermediate") return "Medium";
		if (difficulty === "advanced") return "Hard";
		return i18n.t(`exercise.difficulty.${difficulty}`);
	}

	function getTimeDisplay() {
		let totalSeconds: number;
		if ("timeToComplete" in props.exercise) {
			// Standard exercise - use customized options if available
			const options = getExerciseCustomizedOptions(props.exercise as Exercise, customizedExercises);
			totalSeconds = options.exerciseTime;
		} else {
			// Custom exercise - use its own customizableOptions
			totalSeconds = parseFloat(props.exercise.customizableOptions.exerciseTime.toString());
		}
		
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = Math.floor(totalSeconds % 60);

		if (minutes === 0) {
			return `${seconds} ${i18n.t("exercise.card.seconds")}`;
		} else if (seconds === 0) {
			return `${minutes} ${i18n.t("exercise.card.minutes")}`;
		} else {
			return `${minutes} ${i18n.t("exercise.card.minutes")} ${seconds} ${i18n.t("exercise.card.seconds")}`;
		}
	}

	return (
		<Card variant="outline" className={`bg-background-500 shadow-sm border-2 border-outline-700 p-4 rounded-xl relative overflow-hidden ${props.classes}`}>
			{props.onRemove && (
				<Button
					size="sm"
					variant="solid"
					action="negative"
					className="absolute top-2 right-2 w-7 h-7 rounded-full z-10"
					onPress={props.onRemove}
				>
					<ButtonIcon as={X} size="xs" />
				</Button>
			)}
			<VStack space="md" style={{ flex: 1 }}>
				<Heading size="xl" numberOfLines={2} style={{ paddingRight: props.onRemove ? 40 : 0 }}>
					{props.exercise.name}
				</Heading>
				<VStack space="md">
					<HStack space="md" className="items-center flex-wrap">
						<HStack space="xs" className="items-center flex-shrink">
							<Icon size="md" as={Clock} className="text-typography-600" />
							<Text size="md" className="text-typography-600" numberOfLines={1}>
								{getTimeDisplay()}
							</Text>
						</HStack>
						<Badge action={getDifficultyBadgeColor()} variant="solid" size="md" className="rounded-full flex-shrink-0">
							<BadgeText>{getDifficultyLabel()}</BadgeText>
						</Badge>
					</HStack>
				</VStack>
			</VStack>
		</Card>
	);
}

export default RoutineExerciseCard;
