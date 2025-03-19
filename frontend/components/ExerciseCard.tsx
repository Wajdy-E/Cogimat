import { Image } from "@/components/ui/image";
import { View } from "react-native";
import { Exercise, ExerciseDifficulty } from "../store/data/dataSlice";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Flame, Clock } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { VStack } from "@/components/ui/vstack";
import PlayButton from "./PlayButton";
import FavouriteButton from "./FavouriteButton";
import { setFavourite } from "../store/data/dataSaga";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
interface ExerciseCardProps {
	name: string;
	difficulty: ExerciseDifficulty;
	time: string;
	imageFileName: string;
	isFavourited: boolean;
	id?: number;
	exercise: Exercise;
	classes?: string;
	variant?: "elevated" | "outline" | "ghost" | "filled" | undefined;
}

const imageMap: Record<string, any> = {
	"placeholder.png": require("../assets/placeholder.png"),
};

function ExerciseCard(props: ExerciseCardProps) {
	const dispatch: AppDispatch = useDispatch();

	const exerciseImage = imageMap[props.imageFileName];

	function onFavourite() {
		const exerciseCopy = { ...props.exercise };
		exerciseCopy.isFavourited = !props.exercise.isFavourited;
		dispatch(setFavourite({ exerciseId: exerciseCopy.id, isFavourited: exerciseCopy.isFavourited }));
	}
	return (
		<Card
			variant={props.variant ? props.variant : "outline"}
			className={`p-0 rounded-2xl overflow-hidden ${props.classes}`}
		>
			<VStack space="sm" className="content relative">
				<View className="relative">
					<Image className="w-full h-36" source={exerciseImage} alt={props.name} resizeMode="cover" />
					<FavouriteButton isFavourited={props.isFavourited ? true : false} onFavourite={onFavourite} />
					<PlayButton id={props.id} exercise={props.exercise} />
				</View>
				<View className="p-2">
					<Heading>{props.name}</Heading>
					<View className="flex-row gap-2">
						<View className="flex-row items-center gap-1">
							<Icon size="md" as={Clock} className="fill-primary-500" />
							<Text>{props.time}</Text>
						</View>
						<View className="flex-row items-center gap-1" style={{ maxWidth: "100%" }}>
							<Icon size="lg" as={Flame} fill="bg-primary-500" className="fill-primary-500" />
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
