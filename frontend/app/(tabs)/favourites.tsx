import { ScrollView, View } from 'react-native';
import { useEffect } from 'react';
import Tab, { TabItem } from '../../components/Tab';
import { useExercise } from '@/hooks/useExercise';
import { useCustomExercise } from '@/hooks/useCustomExercise';
import { Exercise, ExerciseDifficulty, CustomExercise } from '../../store/data/dataSlice';
import ExerciseCard from '../../components/ExerciseCard';
import CustomExerciseCard from '../../components/CustomExerciseCard';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/components/ui/ThemeProvider';
import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { getPublicExercises } from '../../store/data/dataSaga';
import { i18n } from '../../i18n';

function Favourites () {
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

		// Create a map to track exercises by ID to avoid duplicates
		const exerciseMap = new Map();

		// Add standard exercises first
		favoritedStandard.forEach((exercise) => {
			exerciseMap.set(exercise.id, { exercise, type: 'standard' });
		});

		// Add custom exercises, but don't override if already exists
		favoritedCustom.forEach((exercise) => {
			if (!exerciseMap.has(exercise.id)) {
				exerciseMap.set(exercise.id, { exercise, type: 'custom' });
			}
		});

		// Add community exercises, prioritizing them over custom exercises
		favoritedCommunity.forEach((exercise) => {
			exerciseMap.set(exercise.id, { exercise, type: 'community' });
		});

		// Convert map values back to array with type information
		return Array.from(exerciseMap.values());
	}, [exercises, customExercises, publicExercises]);

	const tabs: TabItem[] = useMemo(() => {
		// Get exercises for each difficulty level
		const beginnerExercises = allFavoritedExercises.filter(
			({ exercise }) => exercise.difficulty === ExerciseDifficulty.Beginner,
		);
		const intermediateExercises = allFavoritedExercises.filter(
			({ exercise }) => exercise.difficulty === ExerciseDifficulty.Intermediate,
		);
		const advancedExercises = allFavoritedExercises.filter(
			({ exercise }) => exercise.difficulty === ExerciseDifficulty.Advanced,
		);

		return [
			{
				title: 'Beginner',
				iconName: 'Sprout',
				content: (
					<View>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							className="overflow-visible"
							contentContainerStyle={{ paddingBottom: 50 }}
						>
							<VStack space="md">
								{beginnerExercises.length === 0 ? (
									<Text className="text-center  mt-6">{i18n.t('pages.favourites.emptyState.beginner')}</Text>
								) : (
									beginnerExercises.map(({ exercise, type }) => {
										// Determine if it's a community exercise based on type
										const isCommunityExercise = type === 'community' || 'publicAccess' in exercise;

										// Use appropriate card component
										if (isCommunityExercise || type === 'custom') {
											return (
												<CustomExerciseCard
													key={`${type}-${exercise.id}`}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.customizableOptions?.exerciseTime.toString() || '0'}
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
													key={`${type}-${exercise.id}`}
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
									})
								)}
							</VStack>
						</ScrollView>
					</View>
				),
			},
			{
				title: 'Intermediate',
				iconName: 'Rocket',
				content: (
					<View>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							className="overflow-visible"
							contentContainerStyle={{ paddingBottom: 50 }}
						>
							<VStack space="md">
								{intermediateExercises.length === 0 ? (
									<Text className="text-center  mt-6">{i18n.t('pages.favourites.emptyState.intermediate')}</Text>
								) : (
									intermediateExercises.map(({ exercise, type }) => {
										// Determine if it's a community exercise based on type
										const isCommunityExercise = type === 'community' || 'publicAccess' in exercise;

										// Use appropriate card component
										if (isCommunityExercise || type === 'custom') {
											return (
												<CustomExerciseCard
													key={`${type}-${exercise.id}`}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.customizableOptions?.exerciseTime.toString() || '0'}
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
													key={`${type}-${exercise.id}`}
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
									})
								)}
							</VStack>
						</ScrollView>
					</View>
				),
			},
			{
				title: 'Advanced',
				iconName: 'Trophy',
				content: (
					<View>
						<ScrollView
							showsHorizontalScrollIndicator={false}
							className="overflow-visible"
							contentContainerStyle={{ paddingBottom: 50 }}
						>
							<VStack space="md">
								{advancedExercises.length === 0 ? (
									<Text className="text-center  mt-6">{i18n.t('pages.favourites.emptyState.advanced')}</Text>
								) : (
									advancedExercises.map(({ exercise, type }) => {
										// Determine if it's a community exercise based on type
										const isCommunityExercise = type === 'community' || 'publicAccess' in exercise;

										// Use appropriate card component
										if (isCommunityExercise || type === 'custom') {
											return (
												<CustomExerciseCard
													key={`${type}-${exercise.id}`}
													name={exercise.name}
													imageFileUrl={exercise.imageFileUrl}
													time={exercise.customizableOptions?.exerciseTime.toString() || '0'}
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
													key={`${type}-${exercise.id}`}
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
									})
								)}
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
