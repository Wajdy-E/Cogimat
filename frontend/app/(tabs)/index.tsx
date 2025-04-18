import { ScrollView, View } from "react-native";
import Tab, { TabItem } from "../../components/Tab";
import { Brain, FileChartColumn, UsersRound, ClipboardPen } from "lucide-react-native";
import { useUser } from "@clerk/clerk-expo";
import ExerciseCard from "../../components/ExerciseCard";
import NavigateTo from "../../components/NavigateTo";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useExercise } from "@/hooks/useExercise";
import { CustomExercise, Exercise, ExerciseDifficulty, FilterType, setCurrentFilter } from "../../store/data/dataSlice";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import BlogCard from "../../components/CardWithImage";
import { i18n } from "../../i18n";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import CustomExerciseCard from "../../components/CustomExerciseCard";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { shallowEqual } from "react-redux";

function Home() {
	const { user } = useUser();
	const exercises = useExercise(null) as Exercise[];
	const customExercises = useCustomExercise(null) as CustomExercise[];
	const publicExercises = useSelector((state: RootState) => state.data.publicExercises, shallowEqual);
	const dispatch = useDispatch();
	const dailyChallenge = exercises.find((ex) => ex.isChallenge);
	const onPressAllExercises = (isCustom: boolean) => {
		dispatch(setCurrentFilter(isCustom ? [FilterType.Custom] : [FilterType.Standard]));
	};

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
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
						<HStack space="md">
							{exercises.map((exercise) => (
								<ExerciseCard
									key={exercise.id}
									name={exercise.name}
									imageFileName={exercise.imageFileName}
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
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
						<HStack space="md">
							{customExercises.map((exercise) => (
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
							))}
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
						to="/(tabs)/all-exercises"
						onPress={() => onPressAllExercises(true)}
					/>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
						<HStack space="md">
							{publicExercises?.map((exercise) => (
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
							))}
						</HStack>
					</ScrollView>
				</View>
			),
		},
	];

	return (
		<ScrollView className="bg-background-700">
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
			<Tab tabs={tabs} tabVariant="link" iconTop buttonIconHeight={25} />

			<VStack space="md" className="w-[80%] self-center py-7">
				<Heading size="2xl" className="self-center">
					{i18n.t("home.exerciseOfTheDay")}
				</Heading>
				{dailyChallenge ? (
					<ExerciseCard
						name={dailyChallenge.name}
						imageFileName={dailyChallenge.imageFileName}
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
				<NavigateTo heading="Articles & Tips" text={i18n.t("home.exercisePrograms.seeAll")} classes="justify-between" />
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="overflow-visible"
					contentOffset={{ x: 185, y: 0 }}
				>
					<HStack space="md">
						<BlogCard
							imageUri="https://via.placeholder.com/150"
							imageAlt="Article 1"
							date="March 15, 2025"
							title="Article 1"
							linkUrl="#"
							cardClassName="w-[250px]"
						/>
						<BlogCard
							imageUri="https://via.placeholder.com/150"
							imageAlt="Article 2"
							date="March 14, 2025"
							title="Article 2"
							linkUrl="#"
							cardClassName="w-[250px]"
						/>
						<BlogCard
							imageUri="https://via.placeholder.com/150"
							imageAlt="Article 3"
							date="March 13, 2025"
							title="Article 3"
							linkUrl="#"
							cardClassName="w-[250px]"
						/>
					</HStack>
				</ScrollView>
			</Box>
		</ScrollView>
	);
}

export default Home;
