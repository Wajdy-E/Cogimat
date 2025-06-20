import { Animated, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { useCustomExercise } from "@/hooks/useCustomExercise";
import { CustomExercise } from "../../store/data/dataSlice";
import { i18n } from "../../i18n";
import { Icon } from "@/components/ui/icon";
import { Clock, Sprout, Rocket, Trophy, CirclePlay, Brain } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import MediaSlideshow from "../../components/MediaSlideshow";

function CommunityExerciseProgram() {
	const { id } = useLocalSearchParams();
	const exercise = useCustomExercise(parseInt(id as string)) as CustomExercise;
	const router = useRouter();
	const floatAnim = useRef(new Animated.Value(0)).current;

	if (!exercise) {
		return (
			<View className="flex-1 justify-center items-center">
				<Text>Exercise not found</Text>
			</View>
		);
	}

	const getIconForType = () => {
		switch (exercise.difficulty) {
			case "Beginner":
				return Sprout;
			case "Intermediate":
				return Rocket;
			case "Advanced":
				return Trophy;
			default:
				return Sprout;
		}
	};

	const placeHolder = require("../../assets/exercise-thumbnails/placeholder.png");

	// Prepare media items for slideshow
	const mediaItems = [];

	if (exercise.youtubeUrl) {
		mediaItems.push({ type: "youtube" as const, url: exercise.youtubeUrl });
	}
	if (exercise.videoUrl) {
		mediaItems.push({ type: "video" as const, url: exercise.videoUrl });
	}
	if (exercise.imageFileUrl) {
		mediaItems.push({ type: "image" as const, url: exercise.imageFileUrl });
	}

	const onStartExercise = () => {
		router.push(`/(custom-exercise)/exercise?id=${id}`);
	};

	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(floatAnim, {
					toValue: -10,
					duration: 1000,
					useNativeDriver: true,
				}),
				Animated.timing(floatAnim, {
					toValue: 0,
					duration: 1000,
					useNativeDriver: true,
				}),
			])
		).start();
	}, [floatAnim]);

	return (
		<View className="relative bg-background-700 h-full">
			<ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
				<View style={{ flex: 1 }} className="bg-primary-700 py-5">
					<View className="w-[90%] self-center" style={{ height: 250 }}>
						<MediaSlideshow
							mediaItems={mediaItems}
							height={250}
							autoPlay={mediaItems.length > 1}
							autoPlayInterval={4000}
							showControls={mediaItems.length > 1}
							placeholderImage={placeHolder}
						/>
					</View>
				</View>
				<View className="flex items-center py-5">
					<VStack className="w-[90%]" space="lg">
						<View className="flex-row flex-wrap justify-start gap-4">
							<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
								<BadgeIcon as={getIconForType()} />
								<BadgeText size="lg">{exercise.difficulty}</BadgeText>
							</Badge>
							{(exercise.focus ?? []).length > 0
								? (exercise.focus ?? []).map((f: string) => {
										return (
											<Badge size="lg" variant="solid" action="info" className="flex-row gap-3" key={f}>
												<BadgeIcon as={Brain} />
												<BadgeText>{f}</BadgeText>
											</Badge>
										);
									})
								: null}
							<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
								<BadgeIcon as={Clock} />
								{(() => {
									const totalMinutes = parseFloat(exercise.customizableOptions?.exerciseTime.toString() || "60");
									const minutes = Math.floor(totalMinutes);
									const seconds = Math.round((totalMinutes - minutes) * 60);
									return (
										<BadgeText>
											{minutes} min {seconds} sec
										</BadgeText>
									);
								})()}
							</Badge>
						</View>

						<Heading size="lg">{i18n.t("exercise.page.description")}</Heading>
						<Text>{exercise.description}</Text>
						<Heading size="lg">{i18n.t("exercise.page.instructions")}</Heading>
						<Text>{exercise.instructions}</Text>
					</VStack>
				</View>
			</ScrollView>

			<Animated.View
				style={{
					position: "absolute",
					bottom: "5%",
					alignSelf: "center",
					transform: [{ translateY: floatAnim }],
				}}
			>
				<Button onPress={onStartExercise} className="rounded-full w-full" variant="solid" action="primary" size="xl">
					<ButtonText>{i18n.t("exercise.form.startNow")}</ButtonText>
					<ButtonIcon as={CirclePlay} />
				</Button>
			</Animated.View>
		</View>
	);
}

export default CommunityExerciseProgram;
