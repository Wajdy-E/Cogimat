import { Animated, ScrollView, View, Image as RNImage, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useCommunityExercise } from "@/hooks/useCustomExercise";
import { i18n } from "../../i18n";
import { Clock, CirclePlay, Check, Zap, Target, Volume2 } from "lucide-react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import WebView from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setCurrentExercise } from "@/store/data/dataSlice";
import { getPublicExercises } from "@/store/data/dataSaga";
import CustomExerciseHeader from "@/components/CustomExerciseHeader";
import React from "react";

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
	}, [publicExercises.length]);

	// Set the current exercise in Redux state
	useEffect(() => {
		if (exercise) {
			dispatch(setCurrentExercise(exercise));
		}
	}, [exercise]);

	// Cleanup: clear selected exercise when component unmounts
	useEffect(() => {
		return () => {
			dispatch(setCurrentExercise(null));
		};
	}, []);

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

	// Create video player (hooks must be called unconditionally before early returns)
	// Use empty string as fallback if no video URL
	const videoPlayer = useVideoPlayer(exercise?.videoUrl || "", (player) => {
		if (exercise?.videoUrl) {
			player.loop = true;
		}
	});

	// Early returns after all hooks
	if (isLoading) {
		return (
			<>
				<CustomExerciseHeader showSettings={false} />
				<View className="flex-1 justify-center items-center bg-background-700">
					<Text>{i18n.t("exercise.loading")}</Text>
				</View>
			</>
		);
	}

	if (!exercise) {
		return (
			<>
				<CustomExerciseHeader showSettings={false} />
				<View className="flex-1 justify-center items-center bg-background-700">
					<Text>{i18n.t("exercise.notFound")}</Text>
				</View>
			</>
		);
	}

	const getDifficultyBadgeColor = () => {
		switch (exercise.difficulty) {
			case "Beginner":
				return "success"; // Green for Easy/Beginner
			case "Intermediate":
				return "warning"; // Orange/Yellow for Medium/Intermediate
			case "Advanced":
				return "error"; // Orange/Red for Hard/Advanced
			default:
				return "muted";
		}
	};

	const getDifficultyLabel = () => {
		const difficultyLower = exercise.difficulty.toLowerCase();
		if (difficultyLower === "beginner") return "Easy";
		if (difficultyLower === "intermediate") return "Medium";
		if (difficultyLower === "advanced") return "Hard";
		return i18n.t(`exercise.difficulty.${difficultyLower}`);
	};

	// Helper function to extract YouTube video ID
	const getYouTubeVideoId = (url: string) => {
		const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	// Collect all available media items
	const mediaItems: Array<{ type: "youtube" | "video" | "image"; url: string }> = [];

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

	// Split instructions into numbered list items
	const instructionLines = exercise.instructions
		?.split(/[.!?]\s+|\.\n|\n/)
		?.map((line) => line.trim())
		?.filter((line) => line.length > 0);

	// Get focus array (already an array for CustomExercise)
	const focusArray = exercise.focus ?? [];

	const onStartExercise = () => {
		router.push(`/(custom-exercise)/exercise?id=${id}`);
	};

	return (
		<>
			<CustomExerciseHeader showSettings={false} />
			<View className="relative bg-background-700 h-full">
				<ScrollView contentContainerStyle={{ paddingBottom: 200 }}>
					{/* Media Section - Only render if media exists */}
					{mediaItems.length > 0 && (
						<View className="px-5 pt-5">
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ gap: 15 }}
								style={{ height: 200 }}
							>
								{mediaItems.map((mediaItem, index) => (
									<View
										key={index}
										style={{
											width: 350,
											height: 200,
											borderRadius: 20,
											overflow: "hidden",
											position: "relative",
											backgroundColor: "#1a1a1a",
										}}
									>
										{mediaItem.type === "youtube" && (
											<>
												<WebView
													source={{ uri: mediaItem.url }}
											injectedJavaScriptBeforeContentLoaded={`
												window.isNativeApp = true;
												true;
											`}
											style={{
												width: "100%",
												height: "100%",
											}}
											allowsInlineMediaPlayback={true}
											mediaPlaybackRequiresUserAction={false}
										/>
										<View
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												justifyContent: "center",
												alignItems: "center",
												pointerEvents: "none",
											}}
										>
											<View
												style={{
													width: 60,
													height: 60,
													borderRadius: 30,
													backgroundColor: "rgba(255, 255, 255, 0.9)",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<CirclePlay size={30} color="#06b6d4" fill="#06b6d4" />
											</View>
										</View>
										{/* Watch Tutorial Button */}
										<Pressable
											style={{
												position: "absolute",
												bottom: 12,
												left: 12,
											}}
											onPress={() => {
												// Handle tutorial action
											}}
										>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													backgroundColor: "rgba(0, 0, 0, 0.7)",
													paddingHorizontal: 12,
													paddingVertical: 8,
													borderRadius: 8,
													gap: 6,
												}}
											>
												<Volume2 size={16} color="white" />
												<Text style={{ color: "white", fontSize: 12, fontWeight: "500" }}>
													Watch Tutorial
												</Text>
											</View>
										</Pressable>
											</>
										)}

										{mediaItem.type === "video" && exercise.videoUrl && (
									<>
										<VideoView
											player={videoPlayer}
											allowsFullscreen
											allowsPictureInPicture
											style={{
												width: "100%",
												height: "100%",
											}}
											contentFit="cover"
										/>
										<Pressable
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												bottom: 0,
												justifyContent: "center",
												alignItems: "center",
											}}
											onPress={() => {
												videoPlayer.play();
											}}
										>
											<View
												style={{
													width: 60,
													height: 60,
													borderRadius: 30,
													backgroundColor: "rgba(255, 255, 255, 0.9)",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<CirclePlay size={30} color="#06b6d4" fill="#06b6d4" />
											</View>
										</Pressable>
										{/* Watch Tutorial Button */}
										<Pressable
											style={{
												position: "absolute",
												bottom: 12,
												left: 12,
											}}
											onPress={() => {
												// Handle tutorial action
											}}
										>
											<View
												style={{
													flexDirection: "row",
													alignItems: "center",
													backgroundColor: "rgba(0, 0, 0, 0.7)",
													paddingHorizontal: 12,
													paddingVertical: 8,
													borderRadius: 8,
													gap: 6,
												}}
											>
												<Volume2 size={16} color="white" />
												<Text style={{ color: "white", fontSize: 12, fontWeight: "500" }}>
													Watch Tutorial
												</Text>
											</View>
										</Pressable>
											</>
										)}

										{mediaItem.type === "image" && (
											<RNImage
												source={{ uri: mediaItem.url }}
												style={{
													width: "100%",
													height: "100%",
												}}
												resizeMode="cover"
											/>
										)}
									</View>
								))}
							</ScrollView>
						</View>
					)}

					<View className="flex items-center py-5">
						<VStack className="w-[90%]" space="lg">
							{/* Duration and Difficulty Badges */}
							<View className="flex-row gap-4">
								<View style={{ flex: 1 }}>
									<View
										style={{
											backgroundColor: "#1a2a3a",
											borderRadius: 20,
											padding: 16,
										}}
									>
										<View className="flex-row items-center gap-2 mb-2">
											<Clock size={20} color="#9ca3af" />
											<Text style={{ color: "#9ca3af", fontSize: 12 }}>Duration</Text>
										</View>
										{(() => {
											const totalSeconds = parseFloat(
												exercise.customizableOptions.exerciseTime.toString()
											);
											const minutes = Math.floor(totalSeconds / 60);
											const seconds = totalSeconds % 60;
											return (
												<Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
													{minutes} {i18n.t("exercise.card.minutes")}
													{seconds > 0 && ` ${seconds} ${i18n.t("exercise.card.seconds")}`}
												</Text>
											);
										})()}
									</View>
								</View>

								<View style={{ flex: 1 }}>
									<View
										style={{
											backgroundColor: "#1a2a3a",
											borderRadius: 20,
											padding: 16,
										}}
									>
										<View className="flex-row items-center gap-2 mb-2">
											<Target size={20} color="#9ca3af" />
											<Text style={{ color: "#9ca3af", fontSize: 12 }}>Difficulty</Text>
										</View>
										<Badge
											size="lg"
											variant="solid"
											action={getDifficultyBadgeColor()}
											className="rounded-full self-start"
										>
											<BadgeText size="lg">{getDifficultyLabel()}</BadgeText>
										</Badge>
									</View>
								</View>
							</View>

							{/* How It Works Section */}
							<View
								style={{
									backgroundColor: "#1a2a3a",
									borderRadius: 20,
									padding: 20,
								}}
							>
								<View className="flex-row items-center gap-3 mb-4">
									<Zap size={24} color="#06b6d4" />
									<Heading size="lg" style={{ color: "white" }}>
										How It Works
									</Heading>
								</View>
								<VStack space="md">
									{instructionLines.map((instruction, index) => (
										<View key={index} className="flex-row gap-3">
											<Text
												style={{
													color: "#06b6d4",
													fontSize: 16,
													fontWeight: "bold",
													minWidth: 24,
												}}
											>
												{index + 1}.
											</Text>
											<Text style={{ color: "white", fontSize: 14, flex: 1 }}>
												{instruction}
											</Text>
										</View>
									))}
								</VStack>
							</View>

							{/* Training Benefits Section */}
							{focusArray.length > 0 && (
								<View
									style={{
										backgroundColor: "#1a2a3a",
										borderRadius: 20,
										padding: 20,
									}}
								>
									<Heading size="lg" style={{ color: "white", marginBottom: 16 }}>
										Training Benefits
									</Heading>
									<VStack space="md">
										{focusArray.map((benefit, index) => (
											<View key={index} className="flex-row items-center gap-3">
												<Check size={20} color="#06b6d4" />
												<Text style={{ color: "white", fontSize: 14, flex: 1 }}>
													{benefit}
												</Text>
											</View>
										))}
									</VStack>
								</View>
							)}
						</VStack>
					</View>
				</ScrollView>

				<Animated.View
					style={{
						position: "absolute",
						bottom: "20%",
						alignSelf: "center",
						transform: [{ translateY: floatAnim }],
					}}
				>
					<Button
						onPress={onStartExercise}
						className="rounded-full w-full"
						variant="solid"
						action="primary"
						size="xl"
					>
						<ButtonText>{i18n.t("exercise.form.startNow")}</ButtonText>
						<ButtonIcon as={CirclePlay} />
					</Button>
				</Animated.View>
			</View>
		</>
	);
}

export default CommunityExerciseProgram;
