import { ScrollView, View } from "react-native";
import { useEffect } from "react";
import Tab, { TabItem } from "../../components/Tab";
import { useExercise } from "@/hooks/useExercise";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import { Exercise, ExerciseDifficulty, CustomExercise } from "../../store/data/dataSlice";
import ExerciseCard from "../../components/ExerciseCard";
import CustomExerciseCard from "../../components/CustomExerciseCard";
import { VStack } from "@/components/ui/vstack";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { getPublicExercises } from "../../store/data/dataSaga";

function Favourites() {
	const dispatch: AppDispatch = useDispatch();
	const exerciseData = useExercise(null);
	const customExerciseData = useCustomExercise(null);
	const { themeTextColor } = useTheme();

	// Get public exercises from Redux state
	const publicExercises = useSelector((state: RootState) => state.data.publicExercises);

	// Fetch public exercises when component mounts
	useEffect(() => {
		dispatch(getPublicExercises());
	}, [dispatch]);

	// Safely handle exercises data
	const exercises: Exercise[] = Array.isArray(exerciseData) ? exerciseData : [];
	const customExercises: CustomExercise[] = Array.isArray(customExerciseData) ? customExerciseData : [];

	// Combine all favorited exercises (standard + custom + community)
	const allFavoritedExercises = useMemo(() => {
		const favoritedStandard = exercises.filter((ex) => ex.isFavourited);
		const favoritedCustom = customExercises.filter((ex) => ex.isFavourited);
		const favoritedCommunity = publicExercises.filter((ex) => ex.isFavourited);

		return [...favoritedStandard, ...favoritedCustom, ...favoritedCommunity];
	}, [exercises, customExercises, publicExercises]);

	const tabs: TabItem[] = useMemo(() => {
		return [
			{
				title: "Beginner",
				iconName: "Sprout",
				content: (
					<View>
						<ScrollView showsHorizontalScrollIndicator={false} className="overflow-visible">
							<VStack space="md">
								{allFavoritedExercises
									.filter((exercise) => exercise.difficulty === ExerciseDifficulty.Beginner)
									.map((exercise) => {
										// Determine if it's a community exercise
										const isCommunityExercise = publicExercises.some((ex) => ex.id === exercise.id);

										// Use appropriate card component
										if (isCommunityExercise || "publicAccess" in exercise) {
											return (
												<CustomExerciseCard
													key={`community-${exercise.id}`}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.customizableOptions?.exerciseTime.toString() || "0"}
													difficulty={exercise.difficulty}
													id={exercise.id}
													exercise={exercise as CustomExercise}
													classes="w-full"
													isFavourited={exercise.isFavourited}
													variant="elevated"
													isCommunityExercise={isCommunityExercise}
												/>
											);
										} else {
											return (
												<ExerciseCard
													key={exercise.id}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.timeToComplete}
													difficulty={exercise.difficulty}
													id={exercise.id}
													exercise={exercise as Exercise}
													classes="w-full"
													isFavourited={exercise.isFavourited}
													variant="elevated"
												/>
											);
										}
									})}
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
								{allFavoritedExercises
									.filter((exercise) => exercise.difficulty === ExerciseDifficulty.Intermediate)
									.map((exercise) => {
										// Determine if it's a community exercise
										const isCommunityExercise = publicExercises.some((ex) => ex.id === exercise.id);

										// Use appropriate card component
										if (isCommunityExercise || "publicAccess" in exercise) {
											return (
												<CustomExerciseCard
													key={`community-${exercise.id}`}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.customizableOptions?.exerciseTime.toString() || "0"}
													difficulty={exercise.difficulty}
													id={exercise.id}
													exercise={exercise as CustomExercise}
													classes="w-full"
													isFavourited={exercise.isFavourited}
													variant="elevated"
													isCommunityExercise={isCommunityExercise}
												/>
											);
										} else {
											return (
												<ExerciseCard
													key={exercise.id}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.timeToComplete}
													difficulty={exercise.difficulty}
													id={exercise.id}
													exercise={exercise as Exercise}
													classes="w-full"
													isFavourited={exercise.isFavourited}
													variant="elevated"
												/>
											);
										}
									})}
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
								{allFavoritedExercises
									.filter((exercise) => exercise.difficulty === ExerciseDifficulty.Advanced)
									.map((exercise) => {
										// Determine if it's a community exercise
										const isCommunityExercise = publicExercises.some((ex) => ex.id === exercise.id);

										// Use appropriate card component
										if (isCommunityExercise || "publicAccess" in exercise) {
											return (
												<CustomExerciseCard
													key={`community-${exercise.id}`}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.customizableOptions?.exerciseTime.toString() || "0"}
													difficulty={exercise.difficulty}
													id={exercise.id}
													exercise={exercise as CustomExercise}
													classes="w-full"
													isFavourited={exercise.isFavourited}
													variant="elevated"
													isCommunityExercise={isCommunityExercise}
												/>
											);
										} else {
											return (
												<ExerciseCard
													key={exercise.id}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.timeToComplete}
													difficulty={exercise.difficulty}
													id={exercise.id}
													exercise={exercise as Exercise}
													classes="w-full"
													isFavourited={exercise.isFavourited}
													variant="elevated"
												/>
											);
										}
									})}
							</VStack>
						</ScrollView>
					</View>
				),
			},
		];
	}, [allFavoritedExercises, publicExercises]);

	return (
		<ScrollView className="flex bg-background-700">
			<View>
				<Tab tabVariant="outline" iconTop={false} tabs={tabs} roundedFull context="favourites" />
			</View>
		</ScrollView>
	);
}

export default Favourites;
