import React, { useEffect, useRef, useState } from "react";

import { Animated, ScrollView, View, Image as RNImage } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import WebView from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import { CirclePlay, Rocket, Sprout, Trophy } from "lucide-react-native";
import { Flame, Clock, Brain } from "lucide-react-native";
import { shallowEqual } from "react-redux";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import {
	CustomizableExerciseOptions,
	ExerciseDifficulty,
	setCurrentExercise,
	updateExercise,
} from "../../store/data/dataSlice";
import { RootState } from "../../store/store";
import { i18n } from "../../i18n";
import { useSubscriptionStatus } from "../hooks/useSubscriptionStatus";
import PaywallDrawer from "../../components/PaywallDrawer";
import AlertModal from "../../components/AlertModal";
import ExerciseVideoUpload from "../../components/ExerciseVideoUpload";
import ExerciseVideoGallery from "../../components/ExerciseVideoGallery";

function ExerciseProgram() {
	const dispatch = useDispatch();
	const params = useLocalSearchParams();
	const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
	const exercises = useSelector((state: RootState) => state.data.exercises, shallowEqual);
	const exercise = exercises.filter((exercise) => exercise.id === id)[0];
	const user = useSelector((state: RootState) => state.user.user.baseInfo);
	const { isSubscribed } = useSubscriptionStatus();

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

	const floatAnim = useRef(new Animated.Value(0)).current;
	const router = useRouter();
	const [showVideoUpload, setShowVideoUpload] = useState(false);

	// Prepare media items for horizontal scroll
	const mediaItems = [];
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

	// If no media items, add placeholder
	if (mediaItems.length === 0) {
		mediaItems.push({ type: "image" as const, url: placeholderImageUrl });
	}

	// Create video players for all video items
	const videoPlayers = new Map();
	mediaItems.forEach((item, index) => {
		if (item.type === "video") {
			const player = useVideoPlayer(item.url, (player) => {
				player.loop = true;
			});
			videoPlayers.set(index, player);
		}
	});

	function getIconForType(difficulty: ExerciseDifficulty) {
		return difficulty === ExerciseDifficulty.Beginner
			? Sprout
			: difficulty === ExerciseDifficulty.Intermediate
				? Rocket
				: Trophy;
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
		router.navigate({
			pathname: "/exercise",
			params: {
				data: JSON.stringify(exercise),
			},
		});
	};

	const handleVideoUploadSuccess = () => {
		setShowVideoUpload(false);
	};

	return (
		<>
			<View className="relative bg-background-700">
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

									{item.type === "video" && (
										<VideoView
											player={videoPlayers.get(index)}
											allowsFullscreen
											allowsPictureInPicture
											style={{
												width: "100%",
												height: "100%",
												borderRadius: 20,
											}}
											contentFit="cover"
										/>
									)}

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
									<BadgeIcon as={getIconForType(exercise.difficulty)} />
									<BadgeText size="lg">{exercise.difficulty}</BadgeText>
								</Badge>
								<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
									<BadgeIcon as={Brain} />
									<BadgeText>{exercise.focus}</BadgeText>
								</Badge>
								<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
									<BadgeIcon as={Clock} />
									{(() => {
										const totalSeconds = parseInt(exercise.timeToComplete, 10);
										const minutes = Math.floor(totalSeconds / 60);
										const seconds = totalSeconds % 60;
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

							{/* Settings Button */}
							<Button
								onPress={() => router.push(`/(exercise)/settings?id=${id}`)}
								variant="outline"
								action="primary"
								size="lg"
								className="w-full"
							>
								<ButtonText>{i18n.t("exercise.page.customizeExercise")}</ButtonText>
							</Button>

							{/* Admin Video Upload Section */}
							{user?.isAdmin && (
								<Box className="bg-secondary-500 p-5 rounded-2xl">
									<VStack space="lg">
										<View>
											<Heading size="md" className="text-primary-500">
												{i18n.t("exercise.sections.adminVideoUpload")}
											</Heading>
										</View>

										{showVideoUpload ? (
											<ExerciseVideoUpload
												exerciseId={exercise.id}
												exerciseName={exercise.name}
												onUploadSuccess={handleVideoUploadSuccess}
												onClose={() => setShowVideoUpload(false)}
											/>
										) : (
											<Button onPress={() => setShowVideoUpload(true)} action="primary" className="w-full">
												<ButtonText>{i18n.t("exercise.sections.uploadVideo")}</ButtonText>
											</Button>
										)}
									</VStack>
								</Box>
							)}

							<Box className="bg-secondary-500 p-5 rounded-2xl">
								<ExerciseVideoGallery exerciseId={exercise.id} />
							</Box>
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
