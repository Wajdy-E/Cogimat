import { View, SafeAreaView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BackButton from "./BackButton";
import { Heading } from "@/components/ui/heading";
import { useExercise } from "@/hooks/useExercise";
import { Exercise } from "../store/data/dataSlice";
import { Button, ButtonIcon } from "@/components/ui/button";
import { Star } from "lucide-react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { setFavourite } from "../store/data/dataSaga";

export default function Header() {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const exercises = useExercise(parseInt(id[0])) as Exercise;

	function onFavourite() {
		const exerciseCopy = { ...exercises };
		exerciseCopy.isFavourited = !exercises.isFavourited;
		dispatch(setFavourite({ isFavourited: exerciseCopy.isFavourited, exerciseId: exerciseCopy.id }));
	}

	return (
		<SafeAreaView className="bg-background-800">
			<View className="flex-row items-center w-full justify-center py-3">
				<View className="flex-row items-center justify-between gap-3 w-[90%]">
					<View className="flex-row items-center gap-3">
						<BackButton classes="mb-0" />
						<Heading className="text-typography-950" size="2xl">
							{exercises!.name}
						</Heading>
					</View>
					<Button variant="link" onPress={onFavourite}>
						<ButtonIcon
							as={Star}
							stroke={`${exercises.isFavourited ? "yellow" : "white"}`}
							fill={`${exercises.isFavourited ? "yellow" : "white"}`}
							size="xl"
							className={`${exercises.isFavourited ? "fill-yellow-300" : ""}`}
						/>
					</Button>
				</View>
			</View>
		</SafeAreaView>
	);
}
