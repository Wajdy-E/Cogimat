import { ScrollView, View, useColorScheme } from "react-native";
import Tab, { TabItem } from "@/components/Tab";
import { useUser } from "@clerk/clerk-expo";
import ExerciseCard from "@/components/ExerciseCard";
import NavigateTo from "@/components/NavigateTo";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useExercise } from "@/hooks/useExercise";
import {
	CustomExercise,
	Exercise,
	ExerciseDifficulty,
	FilterType,
	setCurrentFilter,
	setCustomExerciseModalPopup,
	setPaywallModalPopup,
	getExerciseCustomizedOptions,
} from "@/store/data/dataSlice";
import { VStack } from "@/components/ui/vstack";
import BlogCard from "@/components/CardWithImage";
import { i18n } from "@/i18n";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { useRouter } from "expo-router";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import CustomExerciseCard from "@/components/CustomExerciseCard";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ChevronRight, Flame, Trophy, ListChecks, Lock, Crown, Clock } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import CreateExerciseModal from "@/components/program-components/CreateExerciseModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import UpgradeCard from "@/components/UpgradeCard";
import React, { useEffect } from "react";
import { getPublicExercises } from "@/store/data/dataSaga";
import { useTheme } from "@/components/ui/ThemeProvider";

function Home() {
	const { user } = useUser();
	const router = useRouter();
	const { theme } = useTheme();
	const exerciseData = useExercise(null);
	const customExerciseData = useCustomExercise(null);
	const { publicExercises, isOpen } = useSelector(
		(state: RootState) => ({
			publicExercises: state.data.publicExercises,
			isOpen: state.data.popupStates?.customExerciseModalIsOpen ?? false,
		}),
		shallowEqual
	);

	// Get user info from Redux to check admin status
	const userInfo = useSelector((state: RootState) => state.user.user.baseInfo);
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises);
	// Safely handle exercises data
	const exercises: Exercise[] = Array.isArray(exerciseData) ? exerciseData : [];
	const customExercises: CustomExercise[] = Array.isArray(customExerciseData) ? customExerciseData : [];

	const { isSubscribed } = useSubscriptionStatus();
	const dispatch: AppDispatch = useDispatch();

	// Fetch public exercises when component mounts
	useEffect(() => {
		dispatch(getPublicExercises());
	}, []);

	const dailyChallenge = exercises.find((ex) => ex.isChallenge);
	const onPressAllExercises = (isCustom: boolean) => {
		dispatch(setCurrentFilter(isCustom ? [FilterType.Custom] : [FilterType.Standard]));
	};

	const premiumExercises = exercises.filter((exercise) => exercise.isPremium);
	const tabs: TabItem[] = [
		{
			title: i18n.t("home.tabs.allExercises"),
			iconName: "Brain",
			content: (
				<View>
					<NavigateTo
						heading={i18n.t("home.tabs.allExercises")}
						text={i18n.t("home.exercisePrograms.seeAll")}
						classes="justify-between"
						to="/(tabs)/all-exercises"
						onPress={() => onPressAllExercises(false)}
					/>
					<VStack space="md">
						{exercises
							.filter((exercise) => !exercise.isPremium)
							.slice(0, 3)
							.map((exercise) => (
								<ExerciseCard
									key={`standard-exercise-${exercise.id}`}
									name={exercise.name}
									imageFileUrl={exercise.imageFileUrl}
									time={exercise.timeToComplete}
									difficulty={exercise.difficulty}
									id={exercise.id}
									exercise={exercise}
									isFavourited={exercise.isFavourited}
									variant="elevated"
								/>
							))}
					</VStack>
				</View>
			),
		},
		{
			title: i18n.t("home.tabs.myCustomExercises"),
			iconName: "ClipboardPen",
			content: (
				<View>
					<NavigateTo
						heading={i18n.t("home.tabs.myCustomExercises")}
						text={i18n.t("home.exercisePrograms.seeAll")}
						classes="justify-between"
						to="/(tabs)/all-exercises"
						onPress={() => onPressAllExercises(true)}
					/>
					<VStack space="md">
						{customExercises.length === 0 ? (
							<VStack space="lg" className="bg-background-500 rounded-md p-3 w-full">
								<Text size="lg">{i18n.t("home.tabs.noCustomExercises")}</Text>
								<Button
									variant="solid"
									onPress={() => dispatch(setCustomExerciseModalPopup(true))}
									action="primary"
									size="md"
									className="rounded-xl"
								>
									<ButtonText>{i18n.t("home.tabs.createCustomExercise")}</ButtonText>
									<ButtonIcon as={ChevronRight} />
								</Button>
							</VStack>
						) : (
							customExercises
								.slice(0, 3)
								.map((exercise) => (
									<CustomExerciseCard
										key={`custom-exercise-${exercise.id}`}
										name={exercise.name}
										imageFileUrl={exercise.imageFileUrl}
										time={exercise.customizableOptions.exerciseTime.toString()}
										difficulty={exercise.difficulty}
										id={exercise.id}
										exercise={exercise}
										isFavourited={exercise.isFavourited}
										variant="elevated"
									/>
								))
						)}
					</VStack>
				</View>
			),
		},
		{
			title: i18n.t("home.tabs.community"),
			iconName: "UsersRound",
			content: (
				<View>
					<NavigateTo
						heading={i18n.t("home.tabs.community")}
						text={i18n.t("home.exercisePrograms.seeAll")}
						classes="justify-between"
						to="/(tabs)/community-exercises"
						onPress={() => {}}
					/>
					<VStack space="md">
						{publicExercises.length === 0 ? (
							<VStack space="lg" className="bg-background-500 rounded-md p-3 w-full">
								<Text size="lg">{i18n.t("home.tabs.noPublicExercises")}</Text>
							</VStack>
						) : (
							publicExercises
								?.slice(0, 3)
								.map((exercise) => (
									<CustomExerciseCard
										key={`community-exercise-${exercise.id}`}
										name={exercise.name}
										imageFileUrl={exercise.imageFileUrl}
										time={exercise.customizableOptions.exerciseTime.toString()}
										difficulty={exercise.difficulty}
										id={exercise.id}
										exercise={exercise}
										isFavourited={exercise.isFavourited}
										variant="elevated"
										isCommunityExercise={true}
									/>
								))
						)}
					</VStack>
				</View>
			),
		},
	];

	return (
		<ScrollView className="bg-background-700" contentContainerStyle={{ paddingBottom: 50 }}>
			<SafeAreaView>
				{/* Admin Top Bar */}
				{userInfo?.isAdmin && (
					<Box className="w-full bg-red-600 py-2 mb-5">
						<Text className="text-white text-center font-bold text-sm">{i18n.t("home.adminTopBar")}</Text>
					</Box>
				)}
			</SafeAreaView>

			<VStack space="2xl" className="w-[90%] self-center">
				{/* Greeting Section */}
				<View className="flex-row items-center gap-3">
					<Avatar size="xl">
						<AvatarImage source={{ uri: user?.imageUrl }} />
					</Avatar>
					<View>
						<Heading className="text-primary-500" size="xl">
							{i18n.t("home.greeting", { name: user?.firstName })}
						</Heading>
						<Text>{i18n.t("home.subtitle")}</Text>
					</View>
				</View>

				{/* Tab Section */}
				<Tab tabs={tabs} tabVariant="link" iconTop buttonIconHeight={25} context="home" />

				{/* Exercise of the Day Section */}
				<VStack space="md">
					<Badge action="warning" variant="solid" size="lg" className="self-start gap-2 rounded-full">
						<BadgeIcon as={Trophy} />
						<BadgeText bold>{i18n.t("home.exerciseOfTheDay")}</BadgeText>
					</Badge>
					{dailyChallenge ? (
						<ExerciseCard
							name={dailyChallenge.name}
							imageFileUrl={dailyChallenge.imageFileUrl}
							time={dailyChallenge.timeToComplete}
							difficulty={dailyChallenge.difficulty}
							id={dailyChallenge.id}
							variant="elevated"
							isFavourited={dailyChallenge.isFavourited}
							exercise={dailyChallenge}
						/>
					) : null}
				</VStack>

				{/* Routines Section */}
				<Card variant="outline" className="bg-primary-500/10 border-2 border-primary-500 rounded-xl p-4">
					<VStack space="md">
						<HStack space="sm" className="items-center">
							<View className="bg-primary-500 rounded-full p-2">
								<Icon as={ListChecks} size="xl" className="text-white" fill="white" />
							</View>
							<Heading size="xl" className="text-primary-500 flex-1">
								{i18n.t("routines.title")}
							</Heading>
						</HStack>
						<Text size="md" className="text-typography-600">
							{i18n.t("routines.description")}
						</Text>
						<Button
							variant="solid"
							action="primary"
							size="md"
							onPress={() => router.push("/routines")}
							className="w-full rounded-xl"
						>
							<ButtonText className="text-white">{i18n.t("routines.title")}</ButtonText>
							<ButtonIcon as={ChevronRight} className="text-white" />
						</Button>
					</VStack>
				</Card>

				{/* Upgrade Card */}
				{!isSubscribed && <UpgradeCard />}
				
				{/* Premium Exercises Section */}
				{premiumExercises.length > 0 && (
					<VStack space="lg">
						{/* Pro Exclusives Header */}
						<HStack space="sm" className="items-center">
							<Icon 
								as={Crown} 
								size="lg" 
								className="text-purple-400" 
								fill="currentColor"
								style={{ color: '#C084FC' }} // Purple-400
							/>
							<Heading size="xl" className="text-typography-950 font-bold">
								{i18n.t("home.exclusiveExercises")}
							</Heading>
						</HStack>

						{/* Pro Exclusive Cards */}
						<VStack space="md">
							{exercises
								.filter((exercise) => exercise.isPremium)
								.slice(0, 5)
								.map((exercise) => {
									const customOptions = getExerciseCustomizedOptions(exercise, customizedExercises);
									const totalSeconds = customOptions.exerciseTime;
									const minutes = Math.floor(totalSeconds / 60);
									const timeDisplay = `${minutes} min`;

									// Get difficulty badge color (matching ExerciseCard)
									const getDifficultyBadgeColor = () => {
										switch (exercise.difficulty) {
											case ExerciseDifficulty.Beginner:
												return "success"; // Green for Easy/Beginner
											case ExerciseDifficulty.Intermediate:
												return "warning"; // Orange/Yellow for Medium/Intermediate
											case ExerciseDifficulty.Advanced:
												return "error"; // Orange/Red for Hard/Advanced
											default:
												return "muted";
										}
									};

									// Get difficulty label
									const getDifficultyLabel = () => {
										const difficulty = exercise.difficulty.toLowerCase();
										if (difficulty === "beginner") return "Easy";
										if (difficulty === "intermediate") return "Medium";
										if (difficulty === "advanced") return "Expert";
										return i18n.t(`exercise.difficulty.${difficulty}`);
									};

									return (
										<Card
											key={`pro-exclusive-${exercise.id}`}
											variant="elevated"
											className="rounded-xl p-4 relative"
											style={{
												backgroundColor: theme === 'dark' ? 'rgba(88, 28, 135, 0.3)' : '#FFFFFF', // White in light mode, dark purple in dark mode
												borderWidth: 2,
												borderColor: 'rgba(168, 85, 247, 0.4)', // Purple border
											}}
										>
											<View 
												style={{
													position: 'absolute',
													top: 16,
													right: 16,
													backgroundColor: 'rgba(168, 85, 247, 0.2)', // Subtle purple background
													borderRadius: 8,
													padding: 4,
												}}
											>
												<Icon as={Lock} size="md" className="text-typography-400" />
											</View>

											<VStack space="md">
												{/* Title */}
												<Heading size="xl" className="text-typography-950 pr-8">
													{exercise.name}
												</Heading>

												{/* Time and Difficulty Badge */}
												<HStack space="md" className="items-center">
													<HStack space="xs" className="items-center">
														<Icon as={Clock} size="sm" className="text-typography-400" />
														<Text size="md" className="text-typography-400">
															{timeDisplay}
														</Text>
													</HStack>
													<Badge 
														action={getDifficultyBadgeColor()}
														variant="solid" 
														size="md" 
														className="rounded-full"
													>
														<BadgeText>{getDifficultyLabel()}</BadgeText>
													</Badge>
												</HStack>

												{/* Unlock Button - Only show if not subscribed */}
												{!isSubscribed && (
													<Button
														variant="solid"
														size="md"
														onPress={() => dispatch(setPaywallModalPopup(true))}
														className="w-full rounded-xl"
														style={{
															backgroundColor: '#A855F7', // Vibrant purple gradient color
														}}
													>
														<ButtonIcon as={Lock} size="sm" className="text-white" />
														<ButtonText className="text-white font-semibold">
															{i18n.t("home.unlockWithPro")}
														</ButtonText>
													</Button>
												)}
											</VStack>
										</Card>
									);
								})}
						</VStack>
					</VStack>
				)}
			</VStack>

			{/* <Box className="w-[90%] self-center">
				<NavigateTo
					heading={i18n.t("home.articlesAndTips")}
					text={i18n.t("home.exercisePrograms.seeAll")}
					classes="justify-between"
				/>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="overflow-visible"
					nestedScrollEnabled={true}
					decelerationRate={0}
					scrollEventThrottle={16}
					onScrollBeginDrag={() => {}}
					onScrollEndDrag={() => {}}
					onMomentumScrollEnd={() => {}}
				>
					<HStack space="md">
						<BlogCard
							imageUri="https://via.placeholder.com/150"
							imageAlt={i18n.t("home.article1")}
							date="March 15, 2025"
							title={i18n.t("home.article1")}
							linkUrl="#"
							cardClassName="w-[250px]"
						/>
						<BlogCard
							imageUri="https://via.placeholder.com/150"
							imageAlt={i18n.t("home.article2")}
							date="March 14, 2025"
							title={i18n.t("home.article2")}
							linkUrl="#"
							cardClassName="w-[250px]"
						/>
						<BlogCard
							imageUri="https://via.placeholder.com/150"
							imageAlt={i18n.t("home.article3")}
							date="March 13, 2025"
							title={i18n.t("home.article3")}
							linkUrl="#"
							cardClassName="w-[250px]"
						/>
					</HStack>
				</ScrollView>
			</Box> */}
			<CreateExerciseModal isOpen={isOpen} onClose={() => dispatch(setCustomExerciseModalPopup(false))} />
		</ScrollView>
	);
}

export default Home;
