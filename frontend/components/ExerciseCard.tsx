import { Image } from "@/components/ui/image";
import { View, TouchableOpacity } from "react-native";
import { Exercise, ExerciseDifficulty } from "../store/data/dataSlice";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Flame, Clock, Sprout, Rocket, Trophy, Crown } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import PlayButton from "./PlayButton";
import FavouriteButton from "./FavouriteButton";
import { setFavourite } from "../store/data/dataSaga";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { i18n } from "../i18n";
import { useSubscriptionStatus } from "../app/hooks/useSubscriptionStatus";

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
}

const placeHolder = require("../assets/exercise-thumbnails/placeholder.png");

function ExerciseCard(props: ExerciseCardProps) {
	const dispatch: AppDispatch = useDispatch();
	const { isSubscribed } = useSubscriptionStatus();
	const exerciseImage = props.imageFileUrl ? { uri: props.imageFileUrl } : placeHolder;

	function onFavourite() {
		const exerciseCopy = { ...props.exercise };
		exerciseCopy.isFavourited = !props.exercise.isFavourited;
		dispatch(setFavourite({ exerciseId: exerciseCopy.id, isFavourited: exerciseCopy.isFavourited }));
	}

	function getIconForType() {
		return (
			<Icon
				size="lg"
				as={
					props.difficulty === ExerciseDifficulty.Beginner
						? Sprout
						: props.difficulty === ExerciseDifficulty.Intermediate
							? Rocket
							: Trophy
				}
			/>
		);
	}

	const CardContent = (
		<Card
			variant={props.variant ? props.variant : "outline"}
			className={`p-0 rounded-md overflow-hidden ${props.classes}`}
		>
			<VStack space="sm" className="content relative">
				<View className="relative">
					<Image className="w-full h-36" source={exerciseImage} alt={props.name} resizeMode="cover" />
					<FavouriteButton isFavourited={props.isFavourited ? true : false} onFavourite={onFavourite} />
					<PlayButton id={props.id} exercise={props.exercise} onClick={props.onClick} />
				</View>
				<View className="p-2">
					<Heading numberOfLines={1} style={{ maxWidth: "90%" }}>
						{props.name}
					</Heading>
					<View className="flex-row gap-2">
						<View className="flex-row items-center gap-1">
							<Icon size="md" as={Clock} />
							{(() => {
								const totalSeconds = parseInt(props.time, 10);
								const minutes = Math.floor(totalSeconds / 60);
								const seconds = totalSeconds % 60;
								return (
									<Text>
										{minutes} {i18n.t("exercise.card.minutes")}
										{seconds > 0 && ` ${seconds} ${i18n.t("exercise.card.seconds")}`}
									</Text>
								);
							})()}
						</View>
						<View className="flex-row items-center gap-1" style={{ maxWidth: "100%" }}>
							{getIconForType()}
							<Text size="lg" ellipsizeMode="tail" numberOfLines={1}>
								{i18n.t(`exercise.difficulty.${props.difficulty.toLowerCase()}`)}
							</Text>
						</View>
					</View>
				</View>
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
