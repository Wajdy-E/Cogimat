import { View, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { useExercise } from "@/hooks/useExercise";
import { Exercise } from "../store/data/dataSlice";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ArrowLeft, Star, Settings } from "lucide-react-native";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { setFavourite } from "../store/data/dataSaga";
import { useTheme } from "@/components/ui/ThemeProvider";

interface HeaderProps {
	showSettings?: boolean;
}

export default function CustomExerciseHeader({ showSettings = true }: HeaderProps) {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const exercises = useExercise(parseInt(id[0])) as Exercise;
	const router = useRouter();
	const { themeTextColor } = useTheme();

	function onFavourite() {
		const exerciseCopy = { ...exercises };
		exerciseCopy.isFavourited = !exercises.isFavourited;
		dispatch(setFavourite({ isFavourited: exerciseCopy.isFavourited, exerciseId: exerciseCopy.id }));
	}

	return (
		<SafeAreaView className="bg-background-800">
			<View className="flex-row items-center w-full justify-center py-3">
				<View className="flex-row items-center justify-between gap-3 w-[90%]">
					<View className="flex-row items-center gap-3 flex-1">
						<Button variant="link" onPress={() => router.push("/(tabs)")}>
							<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
						</Button>
						<Heading className="text-typography-950" size="xl" numberOfLines={1} style={{ flex: 1 }}>
							{exercises!.name}
						</Heading>
					</View>
					<View className="flex-row items-center gap-2">
						<Button variant="link" onPress={onFavourite}>
							<ButtonIcon
								as={Star}
								stroke={`${exercises.isFavourited ? "yellow" : "white"}`}
								fill={`${exercises.isFavourited ? "yellow" : "white"}`}
								size={"xxl" as any}
								className={`${exercises.isFavourited ? "fill-yellow-300" : ""}`}
							/>
						</Button>
						{showSettings && (
							<Button variant="link" onPress={() => router.push(`/(exercise)/settings?id=${id}`)}>
								<ButtonIcon as={Settings} size={"xxl" as any} stroke={themeTextColor} />
							</Button>
						)}
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
