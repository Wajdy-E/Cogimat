import { ScrollView, View } from "react-native";
import Tab from "../../components/Tab";
import { Brain, FileChartColumn, UsersRound, ClipboardPen } from "lucide-react-native";
import { useUser } from "@clerk/clerk-expo";
import ExerciseCard from "../../components/ExerciseCard";
import NavigateTo from "../../components/NavigateTo";
import { HStack } from "@/components/ui/hstack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useExercise } from "@/hooks/useExercise";
import { Exercise, ExerciseDifficulty } from "../../store/data/dataSlice";
import { Center } from "@/components/ui/center";
import { VStack } from "@/components/ui/vstack";
import BlogCard from "../../components/CardWithImage";
import { i18n } from "../../i18n";

function Home() {
	const user = useUser();
	const exercises = useExercise(null) as Exercise[];

	const tabs = [
		{
			title: i18n.t("home.tabs.allExercises"),
			icon: <FileChartColumn strokeWidth={2} size={34} stroke="#64DAC4" fill="transparent" />,
			content: (
				<View>
					<NavigateTo
						heading={i18n.t("home.exercisePrograms.title")}
						text={i18n.t("home.exercisePrograms.seeAll")}
						classes="justify-between"
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
								/>
							))}
						</HStack>
					</ScrollView>
				</View>
			),
		},
		{
			title: i18n.t("home.tabs.interactiveExercises"),
			icon: <Brain strokeWidth={2} size={34} stroke="#64DAC4" fill="transparent" strokeOpacity={0.7} />,
			content: <Text>{i18n.t("home.tabs.interactiveExercises")} Content</Text>,
		},
		{
			title: i18n.t("home.tabs.myCustomExercises"),
			icon: <ClipboardPen strokeWidth={2} size={34} stroke="#64DAC4" fill="transparent" />,
			content: <Text>{i18n.t("home.tabs.myCustomExercises")} Content</Text>,
		},
		{
			title: i18n.t("home.tabs.community"),
			icon: <UsersRound strokeWidth={2} size={34} stroke="#64DAC4" fill="transparent" />,
			content: <Text>{i18n.t("home.tabs.community")} Content</Text>,
		},
	];

	return (
		<ScrollView className="bg-background-700">
			<SafeAreaView>
				<View className="flex items-center">
					<Heading className="text-primary-500 w-[90%]" size="2xl">
						{i18n.t("home.greeting", { name: user.user?.firstName })}
					</Heading>
					<Text className="w-[90%]">{i18n.t("home.subtitle")}</Text>
				</View>
			</SafeAreaView>
			<Tab tabs={tabs} tabVariant="link" iconTop={false} />

			<Center className="bg-primary-700 py-7 mt-6">
				<VStack space="md">
					<Heading size="2xl" className="self-center">
						{i18n.t("home.exerciseOfTheDay")}
					</Heading>
					<ExerciseCard
						name={"exercise.name"}
						imageFileName={"placeholder.png"}
						time={"exercise.timeToComplete"}
						difficulty={ExerciseDifficulty.Intermediate}
						id={1}
						classes="w-[90%]"
						variant="elevated"
						isFavourited={true}
						exercise={exercises[0]}
					/>
				</VStack>
			</Center>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				className="overflow-visible py-6"
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
		</ScrollView>
	);
}

export default Home;
