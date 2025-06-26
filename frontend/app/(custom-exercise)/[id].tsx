import { useEffect, useRef, useState } from "react";

import { Animated, ScrollView, View, Image as RNImage } from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import WebView from "react-native-webview";
import { useVideoPlayer, VideoView } from "expo-video";
import { CirclePlay, Rocket, Sprout, Trophy, Clock, Brain } from "lucide-react-native";
import { shallowEqual, useSelector, useDispatch } from "react-redux";

import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

import {
	CustomizableExerciseOptions,
	Exercise,
	ExerciseDifficulty,
	setCurrentExercise,
} from "../../store/data/dataSlice";
import { AppDispatch, RootState } from "../../store/store";
import { i18n } from "../../i18n";
import { updateCustomExerciseThunk } from "../../store/data/dataSaga";
import AlertModal from "../../components/AlertModal";

function ExerciseProgram() {
	const params = useLocalSearchParams();
	const id = parseInt(Array.isArray(params.id) ? params.id[0] : params.id);
	const exercises = useSelector((state: RootState) => state.data.customExercises, shallowEqual);
	const user = useSelector((state: RootState) => state.user.user, shallowEqual);
	const exercise = exercises.filter((exercise) => exercise.id === id)[0];
	const floatAnim = useRef(new Animated.Value(0)).current;
	const dispatch = useDispatch();
	const appDispatch: AppDispatch = useDispatch();

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

	const router = useRouter();

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
					<VStack className="w-[90%]" space="md">
						<View className="flex-row justify-start flex-wrap gap-4">
							<Badge size="lg" variant="solid" action="info" className="flex-row gap-3">
								<BadgeIcon as={getIconForType(exercise.difficulty)} />
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

						{/* Settings Button */}
						<Button
							onPress={() => router.push(`/(custom-exercise)/settings?id=${id}`)}
							variant="outline"
							action="primary"
							size="lg"
							className="w-full"
						>
							<ButtonText>{i18n.t("exercise.page.customizeExercise")}</ButtonText>
						</Button>
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
					onPress={() => router.push("/exercise")}
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
	);
}

export default ExerciseProgram;
