import React, { useState, useEffect } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge, BadgeText } from "@/components/ui/badge";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Calendar, Eye, Tag } from "lucide-react-native";
import { i18n } from "../i18n";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface AdminVideo {
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

interface AdminVideoGalleryProps {
	category?: string;
	showUploadButton?: boolean;
	onVideoSelect?: (video: AdminVideo) => void;
}

export default function AdminVideoGallery({
	category,
	showUploadButton = false,
	onVideoSelect,
}: AdminVideoGalleryProps) {
	const [videos, setVideos] = useState<AdminVideo[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null);

	const user = useSelector((state: RootState) => state.user.user.baseInfo);

	const fetchVideos = async () => {
		try {
			const params = category ? { category } : {};
			const response = await axios.get(`${process.env.BASE_URL}/api/admin/video-upload`, { params });
			setVideos(response.data.videos || []);
		} catch (error) {
			console.error("Failed to fetch admin videos:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchVideos();
	}, [category]);

	const onRefresh = () => {
		setRefreshing(true);
		fetchVideos();
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) {
			return "0 Bytes";
		}
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString();
	};

	const handleVideoPress = (video: AdminVideo) => {
		setSelectedVideo(video);
		onVideoSelect?.(video);
	};

	const player = useVideoPlayer(selectedVideo?.video_url ?? null, (player) => {
		player.loop = false;
	});

	if (loading) {
		return (
			<Box className="bg-secondary-500 p-5 rounded-md">
				<Text className="text-center">{i18n.t("general.loading")}</Text>
			</Box>
		);
	}

	return (
		<VStack space="lg">
			{showUploadButton && user?.isAdmin && (
				<Box className="bg-primary-500 p-4 rounded-xl">
					<Button
						onPress={() => {
							/* Navigate to upload screen */
						}}
						action="secondary"
						className="w-full"
					>
						<ButtonIcon as={Play} />
						<ButtonText>{i18n.t("admin.videoGallery.uploadNew")}</ButtonText>
					</Button>
				</Box>
			)}

			<ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
				<VStack space="md">
					{videos.length === 0 ? (
						<Box className="bg-secondary-500 p-8 rounded-md">
							<Text className="text-center text-typography-600">{i18n.t("admin.videoGallery.noVideos")}</Text>
						</Box>
					) : (
						videos.map((video) => (
							<Card key={video.id} className="bg-secondary-500 p-4 rounded-xl">
								<VStack space="md">
									<View className="flex-row justify-between items-start">
										<View className="flex-1">
											<Heading size="md" className="text-typography-950">
												{video.title}
											</Heading>
											{video.description && <Text className="text-typography-600 mt-1">{video.description}</Text>}
										</View>
										<Badge action="info">
											<BadgeText>{video.category}</BadgeText>
										</Badge>
									</View>

									<View className="flex-row justify-between items-center">
										<View className="flex-row items-center gap-2">
											<Calendar size={16} className="text-typography-600" />
											<Text size="xs" className="text-typography-600">
												{formatDate(video.created_at)}
											</Text>
										</View>
										<View className="flex-row items-center gap-2">
											<Eye size={16} className="text-typography-600" />
											<Text size="xs" className="text-typography-600">
												{video.view_count} {i18n.t("admin.allVideos.views")}
											</Text>
										</View>
									</View>

									{video.tags && video.tags.length > 0 && (
										<View className="flex-row flex-wrap gap-2">
											<Tag size={16} className="text-typography-600" />
											{video.tags.map((tag, index) => (
												<Badge key={index} size="sm" action="info">
													<BadgeText size="sm">{tag}</BadgeText>
												</Badge>
											))}
										</View>
									)}

									<View className="flex-row justify-between items-center">
										<Text size="xs" className="text-typography-600">
											{formatFileSize(video.file_size)}
										</Text>
										<Button onPress={() => handleVideoPress(video)} size="sm" action="primary">
											<ButtonIcon as={Play} />
											<ButtonText>{i18n.t("admin.videoGallery.watch")}</ButtonText>
										</Button>
									</View>
								</VStack>
							</Card>
						))
					)}
				</VStack>
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
									fullscreenOptions={{ enable: true }}
									allowsPictureInPicture
									style={{
										width: "100%",
										height: 200,
										borderRadius: 12,
									}}
									contentFit="cover"
								/>

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
