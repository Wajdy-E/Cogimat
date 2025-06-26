import { Animated, ScrollView, View, Image as RNImage } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { useCommunityExercise } from "@/hooks/useCustomExercise";
import { CustomExercise } from "../../store/data/dataSlice";
import { i18n } from "../../i18n";
import { Icon } from "@/components/ui/icon";
import { Clock, Sprout, Rocket, Trophy, CirclePlay, Brain } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import WebView from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { setCurrentExercise } from "../../store/data/dataSlice";
import { getPublicExercises } from "../../store/data/dataSaga";

// Separate component for video items to avoid hooks violation
const VideoMediaItem = ({ url, index }: { url: string; index: number }) => {
	const player = useVideoPlayer(url, (player) => {
		player.loop = true;
	});

	return (
		<VideoView
			player={player}
			allowsFullscreen
			allowsPictureInPicture
			style={{
				width: "100%",
				height: "100%",
				borderRadius: 20,
			}}
			contentFit="cover"
		/>
	);
};

function CommunityExerciseProgram() {
	const { id } = useLocalSearchParams();
	const router = useRouter();
	const dispatch: AppDispatch = useDispatch();
	const floatAnim = useRef(new Animated.Value(0)).current;
	const [isLoading, setIsLoading] = useState(true);

	// Get public exercises from Redux state
	const publicExercises = useSelector((state: RootState) => state.data.publicExercises);

	// Safely handle the id parameter
	let exerciseId: number | null = null;
	try {
		if (id && typeof id === "string") {
			exerciseId = parseInt(id);
		}
	} catch (error) {
		console.error("Error parsing exercise id:", error);
	}

	// Use the new useCommunityExercise hook that searches both custom and public exercises
	const exercise = useCommunityExercise(exerciseId);

	// Fetch public exercises if they're not loaded yet
	useEffect(() => {
		const fetchPublicExercisesIfNeeded = async () => {
			if (publicExercises.length === 0) {
				try {
					await dispatch(getPublicExercises()).unwrap();
				} catch (error) {
					console.error("Error fetching public exercises:", error);
				}
			}
			setIsLoading(false);
		};

		fetchPublicExercisesIfNeeded();
	}, [dispatch, publicExercises.length]);

	// Set the current exercise in Redux state
	useEffect(() => {
		if (exercise) {
			dispatch(setCurrentExercise(exercise));
		}
	}, [exercise, dispatch]);

	// Cleanup: clear selected exercise when component unmounts
	useEffect(() => {
		return () => {
			dispatch(setCurrentExercise(null));
		};
	}, [dispatch]);

	// Animation effect
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

	// Show loading state while fetching data
	if (isLoading) {
		return (
			<View className="flex-1 justify-center items-center bg-background-700">
				<Text>Loading exercise...</Text>
			</View>
		);
	}

	if (!exercise) {
		return (
			<View className="flex-1 justify-center items-center bg-background-700">
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

	// Prepare media items for horizontal scroll
	const mediaItems: Array<{
		type: "youtube" | "video" | "image";
		url: string;
	}> = [];
	const placeholderImageUrl =
		"https://dti1eh5sohakbabs.public.blob.vercel-storage.com/exercise-media/images/placeholder-ND4gRGq1YR5dapuS2ObPKZZ9SfAXju.png";

	// Helper function to extract YouTube video ID
	const getYouTubeVideoId = (url: string) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	if (exercise.youtubeUrl) {
		const videoId = getYouTubeVideoId(exercise.youtubeUrl);
		if (videoId) {
			mediaItems.push({
				type: "youtube",
				url: `https://www.youtube.com/embed/${videoId}?si=SWqkZtlRD8J8sBL-`,
			});
		}
	}
	if (exercise.videoUrl) {
		mediaItems.push({ type: "video", url: exercise.videoUrl });
	}
	if (exercise.imageFileUrl) {
		mediaItems.push({ type: "image", url: exercise.imageFileUrl });
	}

	// If no media items, add placeholder
	if (mediaItems.length === 0) {
		mediaItems.push({ type: "image", url: placeholderImageUrl });
	}

	const onStartExercise = () => {
		router.push(`/(custom-exercise)/exercise?id=${id}`);
	};

	return (
		<View className="relative bg-background-700 h-full">
			<ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
				<View style={{ flex: 1, height: 250, maxHeight: 250 }} className="bg-primary-700 py-5">
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ paddingHorizontal: 20 }}
						style={{ height: 250 }}
					>
						{mediaItems.map((item, index) => (
							<View
								key={index}
								style={{
									width: 350,
									height: 200,
									marginRight: index < mediaItems.length - 1 ? 15 : 0,
									borderRadius: 20,
									overflow: "hidden",
									position: "relative",
								}}
							>
								{/* Media type indicator */}
								<View
									style={{
										position: "absolute",
										top: 10,
										right: 10,
										backgroundColor: "rgba(0,0,0,0.7)",
										paddingHorizontal: 8,
										paddingVertical: 4,
										borderRadius: 12,
										zIndex: 10,
									}}
								>
									<Text
										style={{
											color: "white",
											fontSize: 10,
											fontWeight: "bold",
											textTransform: "uppercase",
										}}
									>
										{item.type}
									</Text>
								</View>

								{item.type === "youtube" && (
									<WebView
										source={{ uri: item.url }}
										injectedJavaScriptBeforeContentLoaded={`
											window.isNativeApp = true;
											true;
										`}
										style={{
											width: "100%",
											height: "100%",
											borderRadius: 20,
										}}
										allowsInlineMediaPlayback={true}
										mediaPlaybackRequiresUserAction={false}
									/>
								)}

								{item.type === "video" && <VideoMediaItem url={item.url} index={index} />}

								{item.type === "image" && (
									<RNImage
										source={{ uri: item.url }}
										style={{
											width: "100%",
											height: "100%",
											borderRadius: 20,
										}}
										resizeMode="cover"
										onError={() => {
											// If image fails to load, replace with placeholder
											if (item.url !== placeholderImageUrl) {
												item.url = placeholderImageUrl;
											}
										}}
									/>
								)}
							</View>
						))}
					</ScrollView>
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
