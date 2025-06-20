import React, { useState, useEffect } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge, BadgeText } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Calendar, Eye, Upload } from "lucide-react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { showLoadingOverlay, hideLoadingOverlay } from "../store/ui/uiSlice";
import { i18n } from "../i18n";
import axios from "axios";

interface ExerciseVideo {
	id: number;
	title: string;
	description: string;
	category: string;
	video_url: string;
	file_name: string;
	file_size: number;
	content_type: string;
	uploaded_by: string;
	created_at: string;
	view_count: number;
	tags: string[];
}

interface ExerciseVideoGalleryProps {
	exerciseId: number;
	showUploadButton?: boolean;
	onVideoSelect?: (video: ExerciseVideo) => void;
	onUploadClick?: () => void;
}

export default function ExerciseVideoGallery({
	exerciseId,
	showUploadButton = false,
	onVideoSelect,
	onUploadClick,
}: ExerciseVideoGalleryProps) {
	const [videos, setVideos] = useState<ExerciseVideo[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);
	const dispatch = useDispatch();

	const fetchVideos = async () => {
		try {
			const response = await axios.get(`${process.env.BASE_URL}/api/admin/video-upload`, {
				params: { exerciseId },
			});
			setVideos(response.data.videos || []);
		} catch (error) {
			console.error("Failed to fetch exercise videos:", error);
		} finally {
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchVideos();
	}, [exerciseId]);

	const onRefresh = () => {
		setRefreshing(true);
		fetchVideos();
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString();
	};

	const handleVideoPress = (video: ExerciseVideo) => {
		setSelectedVideo(video);
		onVideoSelect?.(video);
	};

	const player = useVideoPlayer(selectedVideo?.video_url ?? null, (player) => {
		player.loop = false;
	});

	if (videos.length === 0) {
		return (
			<Box className="bg-secondary-500 p-8 rounded-2xl">
				<Text className="text-center text-typography-600">{i18n.t("exercise.videoGallery.noVideos")}</Text>
			</Box>
		);
	}

	return (
		<VStack space="lg">
			{/* Header with Upload Button */}
			<View className="flex-row justify-between items-center">
				<Heading size="md" className="text-typography-950">
					{i18n.t("exercise.videoGallery.title")}
				</Heading>
				{showUploadButton && (
					<Button onPress={onUploadClick} size="sm" action="primary">
						<ButtonIcon as={Upload} />
						<ButtonText>{i18n.t("exercise.videoGallery.upload")}</ButtonText>
					</Button>
				)}
			</View>

			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			>
				<View className="flex-row space-x-4">
					{videos.map((video) => (
						<Card key={video.id} className="bg-secondary-500 p-4 rounded-xl" style={{ width: 280 }}>
							<VStack space="md">
								<View className="flex-row justify-between items-start">
									<View className="flex-1">
										<Heading size="sm" className="text-typography-950">
											{video.title}
										</Heading>
										{video.description && (
											<Text className="text-typography-600 mt-1" numberOfLines={2}>
												{video.description}
											</Text>
										)}
									</View>
								</View>

								<View className="flex-row justify-between items-center">
									<View className="flex-row items-center gap-2">
										<Calendar size={14} className="text-typography-600" />
										<Text size="xs" className="text-typography-600">
											{formatDate(video.created_at)}
										</Text>
									</View>
									<View className="flex-row items-center gap-2">
										<Eye size={14} className="text-typography-600" />
										<Text size="xs" className="text-typography-600">
											{video.view_count}
										</Text>
									</View>
								</View>

								<Button onPress={() => handleVideoPress(video)} size="sm" action="primary" className="w-full">
									<ButtonIcon as={Play} />
									<ButtonText>{i18n.t("exercise.videoGallery.watch")}</ButtonText>
								</Button>
							</VStack>
						</Card>
					))}
				</View>
			</ScrollView>

			{/* Video Player Modal */}
			{selectedVideo && (
				<Box className="absolute inset-0 bg-black/80 z-50">
					<View className="flex-1 justify-center items-center p-4">
						<Box className="bg-background-800 p-4 rounded-2xl w-full max-w-md">
							<VStack space="md">
								<Heading size="md" className="text-typography-950">
									{selectedVideo.title}
								</Heading>

								<VideoView
									player={player}
									allowsFullscreen
									allowsPictureInPicture
									style={{
										width: "100%",
										height: 200,
										borderRadius: 12,
									}}
									contentFit="cover"
								/>

								{selectedVideo.description && <Text className="text-typography-600">{selectedVideo.description}</Text>}

								<Button onPress={() => setSelectedVideo(null)} action="secondary">
									<ButtonText>{i18n.t("general.buttons.close")}</ButtonText>
								</Button>
							</VStack>
						</Box>
					</View>
				</Box>
			)}
		</VStack>
	);
}
