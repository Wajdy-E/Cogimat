import { View, TouchableOpacity } from "react-native";
import { Exercise, ExerciseDifficulty, getExerciseCustomizedOptions } from "@/store/data/dataSlice";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Clock, Play, Lock } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import FavouriteButton from "./FavouriteButton";
import { setFavourite } from "@/store/data/dataSaga";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { i18n } from "../i18n";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/ui/ThemeProvider";

interface ExerciseCardProps {
	name: string;
	difficulty: ExerciseDifficulty;
	time: string;
	imageFileUrl?: string;
	isFavourited: boolean;
	id?: number;
	exercise: Exercise;
	classes?: string;
	variant?: "elevated" | "outline" | "ghost" | "filled" | undefined;
	onClick?: () => void;
	/** Premium card styling (purple border/background). When false + not subscribed, shows lock and Unlock button. */
	isPremiumCard?: boolean;
	/** When isPremiumCard, whether user can access (no lock, show Start). Ignored when isPremiumCard is false. */
	isSubscribed?: boolean;
	/** When isPremiumCard && !isSubscribed, called when user taps Unlock. */
	onUnlockPress?: () => void;
}

function ExerciseCard(props: ExerciseCardProps) {
	const dispatch: AppDispatch = useDispatch();
	const router = useRouter();
	const { theme } = useTheme();
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises);

	const isPremium = props.isPremiumCard === true;
	const isLocked = isPremium && props.isSubscribed === false;

	function onFavourite() {
		const exerciseCopy = { ...props.exercise };
		exerciseCopy.isFavourited = !props.exercise.isFavourited;
		dispatch(setFavourite({ exerciseId: exerciseCopy.id, isFavourited: exerciseCopy.isFavourited }));
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
			router.push({
				pathname: `/(exercise)/${props.id}`,
				params: {
					data: JSON.stringify(props.exercise),
				},
			});
		}
	}

	const customOptions = getExerciseCustomizedOptions(props.exercise, customizedExercises);
	const totalSeconds = customOptions.exerciseTime;
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
		<Card
			variant={props.variant ?? "outline"}
			className={`bg-background-500 border-2 p-4 rounded-xl ${isPremium ? "border-[rgba(168,85,247,0.4)]" : "border-outline-700"} ${props.classes}`}
			style={isPremium ? {
				backgroundColor: theme === "dark" ? "rgba(88, 28, 135, 0.3)" : "#FFFFFF",
				borderWidth: 2,
				borderColor: "rgba(168, 85, 247, 0.4)",
			} : undefined}
		>
			<VStack space="md" className="flex justify-between">
				<View className="relative">
					<Heading size="xl" numberOfLines={2} className={isLocked ? "pr-8" : ""}>
						{props.name}
					</Heading>
					{isLocked && (
						<View
							style={{
								position: "absolute",
								top: 0,
								right: 0,
								backgroundColor: "rgba(168, 85, 247, 0.2)",
								borderRadius: 8,
								padding: 4,
							}}
						>
							<Icon as={Lock} size="md" className="text-typography-400" />
						</View>
					)}
				</View>
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

					{isLocked ? (
						<Button
							variant="solid"
							size="md"
							onPress={props.onUnlockPress}
							className="w-full rounded-xl"
							style={{ backgroundColor: "#A855F7" }}
						>
							<ButtonIcon as={Lock} size="sm" className="text-white" />
							<ButtonText className="text-white font-semibold">{i18n.t("home.unlockWithPro")}</ButtonText>
						</Button>
					) : (
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
					)}
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
