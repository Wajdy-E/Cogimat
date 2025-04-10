import { ScrollView, View } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useExercise } from "@/hooks/useExercise";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Box } from "@/components/ui/box";
import { CustomExercise, Exercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import { i18n } from "../../i18n";
import ExerciseCard from "../../components/ExerciseCard";
import CustomExerciseCard from "../../components/CustomExerciseCard";

function AllExercises() {
	const { user } = useUser();
	const exercises = useExercise(null) as Exercise[];
	const customExercises = useCustomExercise(null) as CustomExercise[];

	const getExercisesByDifficulty = (difficulty: ExerciseDifficulty) =>
		exercises.filter((ex) => ex.difficulty === difficulty);

	return (
		<ScrollView className="bg-background-700">
			<SafeAreaView className="px-4">
				<Heading className="text-primary-500 mb-4" size="2xl">
					{i18n.t("allExercises.title")}
				</Heading>

				{/* Beginner */}
				<VStack space="md" className="mb-6">
					<Heading size="xl">{i18n.t("difficulty.beginner")}</Heading>
					<HStack space="md">
						{getExercisesByDifficulty(ExerciseDifficulty.Beginner).map((exercise) => (
							<ExerciseCard
								key={exercise.id}
								name={exercise.name}
								imageFileName={exercise.imageFileName}
								time={exercise.timeToComplete}
								difficulty={exercise.difficulty}
								id={exercise.id}
								exercise={exercise}
								isFavourited={exercise.isFavourited}
								classes="w-[48%]"
								variant="elevated"
							/>
						))}
					</HStack>
				</VStack>

				{/* Intermediate */}
				<VStack space="md" className="mb-6">
					<Heading size="xl">{i18n.t("difficulty.intermediate")}</Heading>
					<HStack space="md">
						{getExercisesByDifficulty(ExerciseDifficulty.Intermediate).map((exercise) => (
							<ExerciseCard
								key={exercise.id}
								name={exercise.name}
								imageFileName={exercise.imageFileName}
								time={exercise.timeToComplete}
								difficulty={exercise.difficulty}
								id={exercise.id}
								exercise={exercise}
								isFavourited={exercise.isFavourited}
								classes="w-[48%]"
								variant="elevated"
							/>
						))}
					</HStack>
				</VStack>

				{/* Advanced */}
				<VStack space="md" className="mb-6">
					<Heading size="xl">{i18n.t("difficulty.advanced")}</Heading>
					<HStack space="md">
						{getExercisesByDifficulty(ExerciseDifficulty.Advanced).map((exercise) => (
							<ExerciseCard
								key={exercise.id}
								name={exercise.name}
								imageFileName={exercise.imageFileName}
								time={exercise.timeToComplete}
								difficulty={exercise.difficulty}
								id={exercise.id}
								exercise={exercise}
								isFavourited={exercise.isFavourited}
								classes="w-[48%]"
								variant="elevated"
							/>
						))}
					</HStack>
				</VStack>

				{/* Custom Exercises */}
				<VStack space="md" className="mb-10">
					<Heading size="xl">{i18n.t("allExercises.custom")}</Heading>
					<HStack space="md">
						{customExercises.map((exercise) => (
							<CustomExerciseCard
								key={exercise.id}
								name={exercise.name}
								imageFileUrl={exercise.imageFileUrl}
								time={exercise.customizableOptions.excerciseTime.toString()}
								difficulty={exercise.difficulty}
								id={exercise.id}
								exercise={exercise}
								isFavourited={exercise.isFavourited}
								classes="w-[48%]"
								variant="elevated"
							/>
						))}
					</HStack>
				</VStack>
			</SafeAreaView>
		</ScrollView>
	);
}

export default AllExercises;
