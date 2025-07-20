import React, { useState, useEffect } from "react";
import { View, ScrollView, Image } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Upload } from "lucide-react-native";
import { i18n } from "../i18n";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setPaywallModalPopup } from "../store/data/dataSlice";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import PaywallDrawer from "./PaywallDrawer";

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
	const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);
	const dispatch = useDispatch();
	const { isSubscribed } = useSubscriptionStatus();
	const [isPaywallOpen, setIsPaywallOpen] = useState(false);

	const fetchVideos = async () => {
		try {
			const response = await axios.get(`${process.env.BASE_URL}/api/admin/video-upload`, {
				params: { exerciseId },
			});
			setVideos(response.data.videos || []);
		} catch (error) {
			console.error("Failed to fetch exercise videos:", error);
		}
	};

	useEffect(() => {
		fetchVideos();
	}, [exerciseId]);

	const handleVideoPress = (video: ExerciseVideo) => {
		if (!isSubscribed) {
			dispatch(setPaywallModalPopup(true));
			return;
		}

		setSelectedVideo(video);
		onVideoSelect?.(video);
	};

	const player = useVideoPlayer(selectedVideo?.video_url ?? null, (player) => {
		player.loop = false;
	});

	if (videos.length === 0) {
		return (
			<Box className="bg-secondary-500 p-8 rounded-md">
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

			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				<HStack space="md">
					{videos.map((video) => (
						<Card key={video.id} style={{ width: 280 }} variant="ghost">
							<VStack space="md">
								{/* Thumbnail Image */}
								<View className="w-full h-32 bg-gray-300 rounded-lg overflow-hidden">
									<Image
										source={{ uri: "https://your-vercel-blob-url.com/video-thumbnail-placeholder.jpg" }}
										style={{ width: "100%", height: "100%" }}
										resizeMode="cover"
									/>
								</View>

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

								<Button onPress={() => handleVideoPress(video)} size="sm" action="primary" className="w-full">
									<ButtonIcon as={Play} />
									<ButtonText>{i18n.t("exercise.videoGallery.watch")}</ButtonText>
								</Button>
							</VStack>
						</Card>
					))}
				</HStack>
			</ScrollView>

			{/* Video Player Modal */}
			{selectedVideo && (
				<Box className="absolute inset-0 bg-black/80 z-50">
					<View className="flex-1 justify-center items-center p-4">
						<Box className="bg-background-800 p-4 rounded-md w-full max-w-md">
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

			{/* Paywall Drawer */}
			<PaywallDrawer isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
		</VStack>
	);
}
