import { View, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { CustomExercise, updateCustomExercise } from "../store/data/dataSlice";
import { Button, ButtonIcon } from "@/components/ui/button";
import { ArrowLeft, Star, Settings } from "lucide-react-native";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useCustomExercise } from "@/hooks/useCustomExercise";

export default function Header() {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const exercises = useCustomExercise(parseInt(id as string)) as CustomExercise;
	const user = useSelector((state: RootState) => state.user.user, shallowEqual);
	const router = useRouter();
	const { themeTextColor } = useTheme();

	console.log(user.baseInfo?.isAdmin);
	function onFavourite() {
		const exerciseCopy = { ...exercises };
		exerciseCopy.isFavourited = !exercises.isFavourited;
		dispatch(updateCustomExercise(exerciseCopy));
	}

	return (
		<SafeAreaView className="bg-background-800">
			<View className="flex-row items-center w-full justify-center py-3">
				<View className="flex-row items-center justify-between gap-3 w-[90%]">
					<View className="flex-row items-center gap-3">
						<Button variant="link" onPress={() => router.push("/(tabs)")}>
							<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
						</Button>
						<Heading className="text-typography-950" size="2xl" numberOfLines={1} style={{ maxWidth: "79%" }}>
							{exercises?.name}
						</Heading>
					</View>
					<View className="flex-row items-center gap-2">
						<Button variant="link" onPress={onFavourite}>
							<ButtonIcon
								as={Star}
								stroke={`${exercises?.isFavourited ? "yellow" : "white"}`}
								fill={`${exercises?.isFavourited ? "yellow" : "white"}`}
								size={"xxl" as any}
								className={`${exercises?.isFavourited ? "fill-yellow-300" : ""}`}
							/>
						</Button>
						{user.baseInfo?.isAdmin && (
							<Button variant="link" onPress={() => router.push(`/(custom-exercise)/settings?id=${id}`)}>
								<ButtonIcon as={Settings} size={"xxl" as any} stroke={themeTextColor} />
							</Button>
						)}
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
