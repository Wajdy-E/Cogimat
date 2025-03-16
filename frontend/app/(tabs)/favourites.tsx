import { ScrollView, View } from "react-native";
import Tab from "../../components/Tab";
import { useExercise } from "@/hooks/useExercise";
import { Exercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import ExerciseCard from "../../components/ExerciseCard";
import { VStack } from "@/components/ui/vstack";
import { Trophy, Rocket, Sprout } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/components/ui/ThemeProvider";
function Favourites() {
	const exercises = useExercise(null) as Exercise[];
	const { themeTextColor } = useTheme();

	const tabs = [
		{
			title: "Beginner",
			icon: <Sprout strokeWidth={2} size={24} stroke={themeTextColor} fill="transparent" />,
			content: (
				<View>
					<ScrollView showsHorizontalScrollIndicator={false} className="overflow-visible">
						<VStack space="md">
							{exercises
								.filter((exercise) => exercise.difficulty === ExerciseDifficulty.Beginner)
								.map((exercise) => (
									<ExerciseCard
										key={exercise.id}
										name={exercise.name}
										imageFileName={exercise.imageFileName}
										time={exercise.timeToComplete}
										difficulty={exercise.difficulty}
										id={exercise.id}
										exercise={exercise}
										classes="w-full"
										isFavourited={exercise.isFavourited}
									/>
								))}
						</VStack>
					</ScrollView>
				</View>
			),
		},
		{
			title: "Intermediate",
			icon: <Rocket strokeWidth={2} size={24} stroke={themeTextColor} fill="transparent" />,
			content: (
				<View>
					<ScrollView showsHorizontalScrollIndicator={false} className="overflow-visible">
						<VStack space="md">
							{exercises
								.filter((exercise) => exercise.difficulty === ExerciseDifficulty.Intermediate)
								.map((exercise) => (
									<ExerciseCard
										key={exercise.id}
										name={exercise.name}
										imageFileName={exercise.imageFileName}
										time={exercise.timeToComplete}
										difficulty={exercise.difficulty}
										id={exercise.id}
										exercise={exercise}
										classes="w-full"
										isFavourited={exercise.isFavourited}
									/>
								))}
						</VStack>
					</ScrollView>
				</View>
			),
		},
		{
			title: "Advanced",
			icon: <Trophy strokeWidth={2} size={24} stroke={themeTextColor} fill="transparent" />,
			content: (
				<View>
					<ScrollView showsHorizontalScrollIndicator={false} className="overflow-visible">
						<VStack space="md">
							{exercises
								.filter((exercise) => exercise.difficulty === ExerciseDifficulty.Advanced)
								.map((exercise) => (
									<ExerciseCard
										key={exercise.id}
										name={exercise.name}
										imageFileName={exercise.imageFileName}
										time={exercise.timeToComplete}
										difficulty={exercise.difficulty}
										id={exercise.id}
										exercise={exercise}
										classes="w-full"
										isFavourited={exercise.isFavourited}
									/>
								))}
						</VStack>
					</ScrollView>
				</View>
			),
		},
	];
	return (
		<ScrollView className="flex bg-background-700">
			<View>
				<Tab tabVariant="solid" iconTop={false} tabs={tabs} />
			</View>
		</ScrollView>
	);
}

export default Favourites;
