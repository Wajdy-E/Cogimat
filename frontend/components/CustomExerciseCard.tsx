import { Image } from "@/components/ui/image";
import { View } from "react-native";
import { CustomExercise, Exercise, ExerciseDifficulty } from "../store/data/dataSlice";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Clock, Sprout, Rocket, Trophy } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import PlayButton from "./PlayButton";
import FavouriteButton from "./FavouriteButton";
import { updateCustomExerciseThunk } from "../store/data/dataSaga";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
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
}

const placeHolder = require("../assets/exercise-thumbnails/placeholder.png");

function ExerciseCard(props: ExerciseCardProps) {
	const dispatch: AppDispatch = useDispatch();

	const exerciseImage = props.imageFileUrl ? { uri: props.imageFileUrl } : placeHolder;

	function onFavourite() {
		const exerciseCopy = { ...props.exercise };
		exerciseCopy.isFavourited = !props.exercise.isFavourited;
		dispatch(updateCustomExerciseThunk(exerciseCopy));
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
	return (
		<Card
			variant={props.variant ? props.variant : "outline"}
			className={`p-0 rounded-md overflow-hidden ${props.classes}`}
		>
			<VStack space="sm" className="content relative">
				<View className="relative">
					<Image className="w-full h-36" source={exerciseImage} alt={props?.name} resizeMode="cover" />
					<FavouriteButton isFavourited={props.isFavourited ? true : false} onFavourite={onFavourite} />
					<PlayButton id={props.id} exercise={props.exercise} isCustomExercise />
				</View>
				<View className="p-2">
					<Heading>{props?.name}</Heading>
					<View className="flex-row gap-2">
						<View className="flex-row items-center gap-1">
							<Icon size="md" as={Clock} />
							{(() => {
								const totalSeconds = parseInt(props.time, 10);
								const minutes = Math.floor(totalSeconds / 60);
								const seconds = totalSeconds % 60;
								return (
									<Text>
										{minutes} min {seconds} sec
									</Text>
								);
							})()}
						</View>
						<View className="flex-row items-center gap-1" style={{ maxWidth: "100%" }}>
							{getIconForType()}
							<Text size="lg" ellipsizeMode="tail" numberOfLines={1}>
								{props.difficulty}
							</Text>
						</View>
					</View>
				</View>
			</VStack>
		</Card>
	);
}

export default ExerciseCard;
