import { View, TouchableOpacity } from "react-native";
import { CustomExercise, ExerciseDifficulty } from "@/store/data/dataSlice";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Clock, Play } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import FavouriteButton from "./FavouriteButton";
import { updateCustomExerciseThunk, setCommunityExerciseFavourite } from "@/store/data/dataSaga";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { i18n } from "../i18n";
import { useRouter } from "expo-router";

interface ExerciseCardProps {
	name: string;
	difficulty: ExerciseDifficulty;
	time: string;
	imageFileUrl?: string;
	isFavourited: boolean;
	id?: number;
	exercise: CustomExercise;
	classes?: string;
	variant?: "elevated" | "outline" | "ghost" | "filled" | undefined;
	isCommunityExercise?: boolean;
	onClick?: () => void;
}

function ExerciseCard(props: ExerciseCardProps) {
	const dispatch: AppDispatch = useDispatch();
	const router = useRouter();

	function onFavourite() {
		if (props.isCommunityExercise) {
			// For community exercises, use the new saga
			dispatch(
				setCommunityExerciseFavourite({
					exerciseId: props.exercise.id,
					isFavourited: !props.exercise.isFavourited,
				})
			);
		} else {
			// For custom exercises, use the existing saga
			const exerciseCopy = { ...props.exercise };
			exerciseCopy.isFavourited = !props.exercise.isFavourited;
			dispatch(updateCustomExerciseThunk(exerciseCopy));
		}
	}

	function getDifficultyBadgeColor() {
		switch (props.difficulty) {
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
		const difficulty = props.difficulty.toLowerCase();
		if (difficulty === "beginner") return "Easy";
		if (difficulty === "intermediate") return "Medium";
		if (difficulty === "advanced") return "Hard";
		return i18n.t(`exercise.difficulty.${difficulty}`);
	}

	function handleStartExercise() {
		if (props.onClick) {
			props.onClick();
		} else {
			let pathname;
			if (props.isCommunityExercise) {
				pathname = `/(community-exercise)/${props.id}`;
			} else {
				pathname = `/(custom-exercise)/${props.id}`;
			}

			router.push({
				pathname,
				params: {
					data: JSON.stringify(props.exercise),
				},
			});
		}
	}

	// Convert from seconds to minutes and seconds for display
	const totalSeconds = parseFloat(props.time);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = Math.floor(totalSeconds % 60);

	function getTimeDisplay() {
		if (minutes === 0) {
			return `${seconds} ${i18n.t("exercise.card.seconds")}`;
		} else if (seconds === 0) {
			return `${minutes} ${i18n.t("exercise.card.minutes")}`;
		} else {
			return `${minutes} ${i18n.t("exercise.card.minutes")} ${seconds} ${i18n.t("exercise.card.seconds")}`;
		}
	}

	const CardContent = (
		<Card variant={props.variant ? props.variant : "outline"} className={`bg-background-500 border-2 border-outline-700 p-4 rounded-xl ${props.classes}`}>
			<VStack space="md" className="flex justify-between">
				<Heading size="xl" numberOfLines={2}>
					{props?.name}
				</Heading>
				<VStack space="md">
					<HStack space="md" className="items-center">
						<HStack space="xs" className="items-center">
							<Icon size="md" as={Clock} className="text-typography-600" />
							<Text size="md" className="text-typography-600">
								{getTimeDisplay()}
							</Text>
						</HStack>
						<Badge action={getDifficultyBadgeColor()} variant="solid" size="md" className="rounded-full">
							<BadgeText>{getDifficultyLabel()}</BadgeText>
						</Badge>
					</HStack>

					<HStack space="sm" className="w-full">
						<View style={{ flex: 0.8 }}>
							<Button variant="solid" action="primary" size="md" onPress={handleStartExercise} className="w-full rounded-xl">
								<ButtonIcon as={Play} size="md" className="text-white" />
								<ButtonText className="text-white">{i18n.t("general.buttons.startExercise")}</ButtonText>
							</Button>
						</View>
						<View style={{ flex: 0.2 }}>
							<FavouriteButton isFavourited={props.isFavourited ? true : false} onFavourite={onFavourite} />
						</View>
					</HStack>
				</VStack>
			</VStack>
		</Card>
	);

	return props.onClick ? (
		<TouchableOpacity onPress={props.onClick} activeOpacity={0.7}>
			{CardContent}
		</TouchableOpacity>
	) : (
		CardContent
	);
}

export default ExerciseCard;
