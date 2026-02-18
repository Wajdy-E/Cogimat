import React, { useEffect, useRef } from "react";

import { Animated, ScrollView, View, Image as RNImage, Pressable } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import WebView from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import { CirclePlay, Rocket, Sprout, Trophy, Check, Zap, Target, Volume2 } from "lucide-react-native";
import { Clock } from "lucide-react-native";
import { useSelector, useDispatch, shallowEqual } from "react-redux";

import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import { ExerciseDifficulty, setCurrentExercise, getExerciseCustomizedOptions } from "@/store/data/dataSlice";
import { RootState } from "@/store/store";
import { i18n } from "../../i18n";
import Header from "@/components/Header";
import MetronomeService from "@/services/MetronomeService";

function ExerciseProgram() {
	const dispatch = useDispatch();
	const params = useLocalSearchParams();
	const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
	const exercises = useSelector((state: RootState) => state.data.exercises, shallowEqual);
	const customizedExercises = useSelector((state: RootState) => state.data.customizedExercises, shallowEqual);
	const exercise = exercises?.filter((ex) => ex.id === id)[0];

	useEffect(() => {
		if (exercise) {
			dispatch(setCurrentExercise(exercise));
		}
	}, [exercise]);

	// Stop metronome when entering exercise details page
	useEffect(() => {
		MetronomeService.stop();

		return () => {
			// Cleanup: clear selected exercise and stop metronome when component unmounts
			dispatch(setCurrentExercise(null));
			MetronomeService.stop();
		};
	}, [dispatch]);

	const floatAnim = useRef(new Animated.Value(0)).current;
	const router = useRouter();
	// Hooks must be called unconditionally - use fallbacks when exercise may be undefined
	const videoPlayer = useVideoPlayer(exercise?.videoUrl || "", (player) => {
		if (exercise?.videoUrl) {
			player.loop = true;
		}
	});

	// Guard: exercise not found (e.g. exercises not loaded yet, or invalid id)
	if (!exercise) {
		return (
			<>
				<Header showSettings={true} />
				<View className="flex-1 justify-center items-center p-4">
					<Text>{i18n.t("exercise.invalidOrMissing")}</Text>
				</View>
			</>
		);
	}

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
				type: "youtube" as const,
				url: `https://www.youtube.com/embed/${videoId}?si=SWqkZtlRD8J8sBL-`,
			});
		}
	}
	if (exercise.videoUrl) {
		mediaItems.push({ type: "video" as const, url: exercise.videoUrl });
	}
	if (exercise.imageFileUrl) {
		mediaItems.push({ type: "image" as const, url: exercise.imageFileUrl });
	}

	// Split instructions into numbered list items (fallback to [] if undefined)
	const instructionLines =
		exercise.instructions
			?.split(/[.!?]\s+|\.\n|\n/)
			?.map((line) => line.trim())
			?.filter((line) => line.length > 0) ?? [];

	// Convert focus string to array for display
	const focusArray = exercise.focus ? [exercise.focus] : [];

	function getIconForType(difficulty: ExerciseDifficulty) {
		return difficulty === ExerciseDifficulty.Beginner
			? Sprout
			: difficulty === ExerciseDifficulty.Intermediate
				? Rocket
				: Trophy;
	}

	function getDifficultyBadgeColor(difficulty: ExerciseDifficulty) {
		switch (difficulty) {
			case ExerciseDifficulty.Beginner:
				return "success"; // Green for Easy/Beginner
			case ExerciseDifficulty.Intermediate:
				return "warning"; // Orange/Yellow for Medium/Intermediate
			case ExerciseDifficulty.Advanced:
				return "error"; // Orange/Red for Hard/Advanced
			default:
				return "muted";
		}
	}

	function getDifficultyLabel(difficulty: ExerciseDifficulty) {
		const difficultyLower = difficulty.toLowerCase();
		if (difficultyLower === "beginner") return "Easy";
		if (difficultyLower === "intermediate") return "Medium";
		if (difficultyLower === "advanced") return "Hard";
		return i18n.t(`exercise.difficulty.${difficultyLower}`);
	}

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

	const handleStartExercise = () => {
		dispatch(setCurrentExercise(exercise!));
		router.navigate({
			pathname: "/exercise",
			params: {
				data: JSON.stringify(exercise),
			},
		});
	};

	return (
		<>
			<Header showSettings={true} />
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
									</>
								)}

										{mediaItem.type === "video" && exercise.videoUrl && (
									<>
										<VideoView
											player={videoPlayer}
											fullscreenOptions={{ enable: true }}
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
											const customOptions = getExerciseCustomizedOptions(
												exercise,
												customizedExercises
											);
											const totalSeconds = customOptions.exerciseTime;
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
											action={getDifficultyBadgeColor(exercise.difficulty)}
											className="rounded-full self-start"
										>
											<BadgeText size="lg">{getDifficultyLabel(exercise.difficulty)}</BadgeText>
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
						onPress={handleStartExercise}
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

export default ExerciseProgram;
