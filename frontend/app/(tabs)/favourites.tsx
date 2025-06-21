import { ScrollView, View } from "react-native";
import Tab, { TabItem } from "../../components/Tab";
import { useExercise } from "@/hooks/useExercise";
import { Exercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import ExerciseCard from "../../components/ExerciseCard";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useMemo } from "react";
function Favourites() {
	const exercises = useExercise(null) as Exercise[];
	const { themeTextColor } = useTheme();
	const tabs: TabItem[] = useMemo(() => {
		return [
			{
				title: "Beginner",
				iconName: "Sprout",
				content: (
					<View>
						<ScrollView showsHorizontalScrollIndicator={false} className="overflow-visible">
							<VStack space="md">
								{exercises
									.filter(
										(exercise) => exercise.difficulty === ExerciseDifficulty.Beginner && exercise.isFavourited === true
									)
									.map((exercise) => (
										<ExerciseCard
											key={exercise.id}
											name={exercise.name}
											imageFileUrl={exercise.imageFileUrl}
											time={exercise.timeToComplete}
											difficulty={exercise.difficulty}
											id={exercise.id}
											exercise={exercise}
											classes="w-full"
											isFavourited={exercise.isFavourited}
											variant="elevated"
										/>
									))}
							</VStack>
						</ScrollView>
					</View>
				),
			},
			{
				title: "Intermediate",
				iconName: "Rocket",
				content: (
					<View>
						<ScrollView showsHorizontalScrollIndicator={false} className="overflow-visible">
							<VStack space="md">
								{exercises
									.filter(
										(exercise) =>
											exercise.difficulty === ExerciseDifficulty.Intermediate && exercise.isFavourited === true
									)
									.map((exercise) => (
										<ExerciseCard
											key={exercise.id}
											name={exercise.name}
											imageFileUrl={exercise.imageFileUrl}
											time={exercise.timeToComplete}
											difficulty={exercise.difficulty}
											id={exercise.id}
											exercise={exercise}
											classes="w-full"
											isFavourited={exercise.isFavourited}
											variant="elevated"
										/>
									))}
							</VStack>
						</ScrollView>
					</View>
				),
			},
			{
				title: "Advanced",
				iconName: "Trophy",
				content: (
					<View>
						<ScrollView showsHorizontalScrollIndicator={false} className="overflow-visible">
							<VStack space="md">
								{exercises
									.filter(
										(exercise) => exercise.difficulty === ExerciseDifficulty.Advanced && exercise.isFavourited === true
									)
									.map((exercise) => (
										<ExerciseCard
											key={exercise.id}
											name={exercise.name}
											imageFileUrl={exercise.imageFileUrl}
											time={exercise.timeToComplete}
											difficulty={exercise.difficulty}
											id={exercise.id}
											exercise={exercise}
											classes="w-full"
											isFavourited={exercise.isFavourited}
											variant="elevated"
										/>
									))}
							</VStack>
						</ScrollView>
					</View>
				),
			},
		];
	}, [exercises]);
	return (
		<ScrollView className="flex bg-background-700">
			<View>
				<Tab tabVariant="outline" iconTop={false} tabs={tabs} roundedFull context="favourites" />
			</View>
		</ScrollView>
	);
}

export default Favourites;
