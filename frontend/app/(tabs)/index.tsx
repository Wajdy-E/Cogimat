import { ScrollView, View } from "react-native";
import { useEffect } from "react";
import Tab, { TabItem } from "../../components/Tab";
import { useUser } from "@clerk/clerk-expo";
import ExerciseCard from "../../components/ExerciseCard";
import NavigateTo from "../../components/NavigateTo";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useExercise } from "@/hooks/useExercise";
import {
	CustomExercise,
	Exercise,
	FilterType,
	setCurrentFilter,
	setCustomExerciseModalPopup,
	setPaywallModalPopup,
} from "../../store/data/dataSlice";
import { VStack } from "@/components/ui/vstack";
import BlogCard from "../../components/CardWithImage";
import { i18n } from "../../i18n";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import CustomExerciseCard from "../../components/CustomExerciseCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { shallowEqual } from "react-redux";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ChevronRight, Trophy } from "lucide-react-native";
import CreateExerciseModal from "../../components/program-components/CreateExerciseModal";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import UpgradeCard from "../../components/UpgradeCard";
import { Icon } from "@/components/ui/icon";
import React from "react";
import { getPublicExercises } from "../../store/data/dataSaga";

function Home() {
	const { user } = useUser();
	const exerciseData = useExercise(null);
	const customExerciseData = useCustomExercise(null);
	const { publicExercises, isOpen } = useSelector(
		(state: RootState) => ({
			publicExercises: state.data.publicExercises,
			isOpen: state.data.popupStates?.customExerciseModalIsOpen ?? false,
		}),
		shallowEqual
	);

	// Safely handle exercises data
	const exercises: Exercise[] = Array.isArray(exerciseData) ? exerciseData : [];
	const customExercises: CustomExercise[] = Array.isArray(customExerciseData) ? customExerciseData : [];

	const { isSubscribed } = useSubscriptionStatus();
	const dispatch: AppDispatch = useDispatch();

	// Fetch public exercises when component mounts
	useEffect(() => {
		dispatch(getPublicExercises());
	}, [dispatch]);

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
						heading={i18n.t("home.exercisePrograms.allTitle")}
						text={i18n.t("home.exercisePrograms.seeAll")}
						classes="justify-between"
						to="/(tabs)/all-exercises"
						onPress={() => onPressAllExercises(false)}
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
							{exercises
								.filter((exercise) => !exercise.isPremium)
								.slice(0, 10)
								.map((exercise) => (
									<ExerciseCard
										key={exercise.id}
										name={exercise.name}
										imageFileUrl={exercise.imageFileUrl}
										time={exercise.timeToComplete}
										difficulty={exercise.difficulty}
										id={exercise.id}
										exercise={exercise}
										classes="w-[250px]"
										isFavourited={exercise.isFavourited}
										variant="elevated"
									/>
								))}
						</HStack>
					</ScrollView>
				</View>
			),
		},
		{
			title: i18n.t("home.tabs.myCustomExercises"),
			iconName: "ClipboardPen",
			content: (
				<View>
					<NavigateTo
						heading={i18n.t("home.exercisePrograms.customTitle")}
						text={i18n.t("home.exercisePrograms.seeAll")}
						classes="justify-between"
						to="/(tabs)/all-exercises"
						onPress={() => onPressAllExercises(true)}
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
							{customExercises.length === 0 ? (
								<VStack space="lg" className="bg-background-500 rounded-md p-3 w-full">
									<Text size="lg">{i18n.t("home.tabs.noCustomExercises")}</Text>
									<Button
										variant="solid"
										onPress={() => dispatch(setCustomExerciseModalPopup(true))}
										action="primary"
										size="md"
									>
										<ButtonText>{i18n.t("home.tabs.createCustomExercise")}</ButtonText>
										<ButtonIcon as={ChevronRight} />
									</Button>
								</VStack>
							) : (
								customExercises
									.slice(0, 10)
									.map((exercise) => (
										<CustomExerciseCard
											key={exercise.id}
											name={exercise.name}
											imageFileUrl={exercise.imageFileUrl}
											time={exercise.customizableOptions.exerciseTime.toString()}
											difficulty={exercise.difficulty}
											id={exercise.id}
											exercise={exercise}
											classes="w-[250px]"
											isFavourited={exercise.isFavourited}
											variant="elevated"
										/>
									))
							)}
						</HStack>
					</ScrollView>
				</View>
			),
		},
		{
			title: i18n.t("home.tabs.community"),
			iconName: "UsersRound",
			content: (
				<View>
					<NavigateTo
						heading={i18n.t("home.exercisePrograms.communityTitle")}
						text={i18n.t("home.exercisePrograms.seeAll")}
						classes="justify-between"
						to="/(tabs)/community-exercises"
						onPress={() => {}}
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
							{publicExercises.length === 0 ? (
								<VStack space="lg" className="bg-background-500 rounded-md p-3 w-full">
									<Text size="lg">{i18n.t("home.tabs.noPublicExercises")}</Text>
								</VStack>
							) : (
								publicExercises?.map((exercise) => (
									<CustomExerciseCard
										key={exercise.id}
										name={exercise.name}
										imageFileUrl={exercise.imageFileUrl}
										time={exercise.customizableOptions.exerciseTime.toString()}
										difficulty={exercise.difficulty}
										id={exercise.id}
										exercise={exercise}
										classes="w-[250px]"
										isFavourited={exercise.isFavourited}
										variant="elevated"
										isCommunityExercise={true}
									/>
								))
							)}
						</HStack>
					</ScrollView>
				</View>
			),
		},
	];

	return (
		<ScrollView className="bg-background-700" contentContainerStyle={{ paddingBottom: 50 }}>
			<SafeAreaView>
				<View className="flex-row items-center gap-3 w-[90%] self-center">
					<Avatar size="xl">
						<AvatarImage source={{ uri: user?.imageUrl }} />
					</Avatar>
					<View>
						<Heading className="text-primary-500" size="2xl">
							{i18n.t("home.greeting", { name: user?.firstName })}
						</Heading>
						<Text className="w-[90%]">{i18n.t("home.subtitle")}</Text>
					</View>
				</View>
			</SafeAreaView>
			<Tab tabs={tabs} tabVariant="link" iconTop buttonIconHeight={25} context="home" />

			<VStack space="md" className="w-[90%] self-center py-7">
				<Heading size="2xl" className="self-center">
					{i18n.t("home.exerciseOfTheDay")}
				</Heading>
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
			<Box className="w-[90%] self-center">
				<VStack space="lg">
					{!isSubscribed && <UpgradeCard />}
					{premiumExercises.length > 0 && (
						<>
							<Heading size="xl">{i18n.t("home.exclusiveExercises")}</Heading>
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
									{exercises
										.filter((exercise) => exercise.isPremium)
										.slice(0, 10)
										.map((exercise) => (
											<ExerciseCard
												key={exercise.id}
												name={exercise.name}
												imageFileUrl={exercise.imageFileUrl}
												time={exercise.timeToComplete}
												difficulty={exercise.difficulty}
												id={exercise.id}
												exercise={exercise}
												classes="w-[250px]"
												isFavourited={exercise.isFavourited}
												variant="elevated"
												onClick={isSubscribed ? undefined : () => dispatch(setPaywallModalPopup(true))}
											/>
										))}
								</HStack>
							</ScrollView>
						</>
					)}
				</VStack>
			</Box>

			<Box className="w-[90%] self-center">
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
			</Box>
			<CreateExerciseModal isOpen={isOpen} onClose={() => dispatch(setCustomExerciseModalPopup(false))} />
		</ScrollView>
	);
}

export default Home;
