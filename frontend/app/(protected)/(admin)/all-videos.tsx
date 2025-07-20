import React, { useState, useEffect } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Input, InputField } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectInput,
	SelectPortal,
	SelectBackdrop,
	SelectContent,
	SelectDragIndicator,
	SelectDragIndicatorWrapper,
	SelectItem,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge, BadgeText } from "@/components/ui/badge";
import { useVideoPlayer, VideoView } from "expo-video";
import { Play, Calendar, Eye, ArrowLeft, Search, Filter } from "lucide-react-native";
import { useTheme } from "@/components/ui/ThemeProvider";
import { i18n } from "../../i18n";
import axios from "axios";

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
	exercise_id: number | null;
	created_at: string;
	view_count: number;
	tags: string[];
}

export default function AllVideos() {
	const router = useRouter();
	const { themeTextColor } = useTheme();
	const user = useSelector((state: RootState) => state.user.user.baseInfo);

	const [videos, setVideos] = useState<AdminVideo[]>([]);
	const [filteredVideos, setFilteredVideos] = useState<AdminVideo[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [selectedVideo, setSelectedVideo] = useState<AdminVideo | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const categories = [
		{ label: i18n.t("admin.categories.allCategories"), value: "all" },
		{ label: i18n.t("admin.categories.exerciseTutorials"), value: "exercise-tutorial" },
		{ label: i18n.t("admin.categories.general"), value: "general" },
		{ label: i18n.t("admin.categories.tutorials"), value: "tutorials" },
		{ label: i18n.t("admin.categories.announcements"), value: "announcements" },
		{ label: i18n.t("admin.categories.exerciseGuides"), value: "exercise-guides" },
		{ label: i18n.t("admin.categories.tipsAndTricks"), value: "tips" },
	];

	const fetchVideos = async () => {
		try {
			const response = await axios.get(`${process.env.BASE_URL}/api/admin/video-upload`);
			setVideos(response.data.videos || []);
			setFilteredVideos(response.data.videos || []);
		} catch (error) {
			console.error("Failed to fetch videos:", error);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		fetchVideos();
	}, []);

	useEffect(() => {
		// Filter videos based on search query and category
		let filtered = videos;

		if (searchQuery.trim()) {
			filtered = filtered.filter(
				(video) =>
					video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					video.description.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (selectedCategory !== "all") {
			filtered = filtered.filter((video) => video.category === selectedCategory);
		}

		setFilteredVideos(filtered);
	}, [videos, searchQuery, selectedCategory]);

	const onRefresh = () => {
		setRefreshing(true);
		fetchVideos();
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString();
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

	const handleVideoPress = (video: AdminVideo) => {
		setSelectedVideo(video);
	};

	const player = useVideoPlayer(selectedVideo?.video_url ?? null, (player) => {
		player.loop = false;
	});

	if (loading) {
		return (
			<View className="bg-background-800 h-screen">
				<Box className="bg-secondary-500 p-5 rounded-md m-5">
					<Text className="text-center">{i18n.t("general.loading")}</Text>
				</Box>
			</View>
		);
	}

	return (
		<View className="bg-background-800 h-screen">
			{/* Header */}
			<View className="flex-row items-center w-full justify-center py-3">
				<View className="flex-row items-center justify-between gap-3 w-[90%]">
					<View className="flex-row items-center gap-3">
						<Button variant="link" onPress={() => router.back()}>
							<ButtonIcon as={ArrowLeft} size={"xxl" as any} stroke={themeTextColor} />
						</Button>
						<Heading className="text-typography-950" size="2xl">
							{i18n.t("admin.allVideos.title")}
						</Heading>
					</View>
				</View>
			</View>

			{/* Search and Filter */}
			<View className="px-5 mb-4">
				<VStack space="md">
					<View className="flex-row items-center gap-2">
						<Search size={20} className="text-typography-600" />
						<Input className="flex-1">
							<InputField
								placeholder={i18n.t("admin.allVideos.searchPlaceholder")}
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
						</Input>
					</View>

					<View className="flex-row items-center gap-2">
						<Filter size={20} className="text-typography-600" />
						<Select selectedValue={selectedCategory} onValueChange={setSelectedCategory}>
							<SelectTrigger className="flex-1">
								<SelectInput placeholder="Select category" />
							</SelectTrigger>
							<SelectPortal>
								<SelectBackdrop />
								<SelectContent>
									<SelectDragIndicatorWrapper>
										<SelectDragIndicator />
									</SelectDragIndicatorWrapper>
									{categories.map((category) => (
										<SelectItem key={category.value} label={category.label} value={category.value} />
									))}
								</SelectContent>
							</SelectPortal>
						</Select>
					</View>
				</VStack>
			</View>

			{/* Videos List */}
			<ScrollView
				className="flex-1 px-5"
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
			>
				<VStack space="md">
					{filteredVideos.length === 0 ? (
						<Box className="bg-secondary-500 p-8 rounded-md">
							<Text className="text-center text-typography-600">{i18n.t("admin.allVideos.noVideos")}</Text>
						</Box>
					) : (
						filteredVideos.map((video) => (
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

									<View className="flex-row justify-between items-center">
										<Text size="xs" className="text-typography-600">
											{formatFileSize(video.file_size)}
										</Text>
										<Button onPress={() => handleVideoPress(video)} size="sm" action="primary">
											<ButtonIcon as={Play} />
											<ButtonText>{i18n.t("admin.allVideos.watch")}</ButtonText>
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
		</View>
	);
}
