import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { VStack } from "@/components/ui/vstack";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { ArrowLeft, Upload, Video } from "lucide-react-native";
import { useTheme } from "@/components/ui/ThemeProvider";
import AdminVideoUpload from "../../components/AdminVideoUpload";
import AdminVideoGallery from "../../components/AdminVideoGallery";
import { i18n } from "../../i18n";

export default function AdminVideoManagement() {
	const router = useRouter();
	const { themeTextColor } = useTheme();
	const user = useSelector((state: RootState) => state.user.user.baseInfo);
	const [activeTab, setActiveTab] = useState<"upload" | "gallery">("gallery");

	// Redirect if not admin
	if (!user?.isAdmin) {
		router.replace("/(tabs)/");
		return null;
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
							{i18n.t("admin.videoManagement.title")}
						</Heading>
					</View>
				</View>
			</View>

			{/* Tab Navigation */}
			<View className="px-5 mb-4">
				<Box className="bg-secondary-500 p-1 rounded-xl">
					<View className="flex-row">
						<Button
							variant={activeTab === "gallery" ? "solid" : "link"}
							action={activeTab === "gallery" ? "primary" : "secondary"}
							className="flex-1"
							onPress={() => setActiveTab("gallery")}
						>
							<ButtonIcon as={Video} />
							<ButtonText>{i18n.t("admin.videoManagement.gallery")}</ButtonText>
						</Button>
						<Button
							variant={activeTab === "upload" ? "solid" : "link"}
							action={activeTab === "upload" ? "primary" : "secondary"}
							className="flex-1"
							onPress={() => setActiveTab("upload")}
						>
							<ButtonIcon as={Upload} />
							<ButtonText>{i18n.t("admin.videoManagement.upload")}</ButtonText>
						</Button>
					</View>
				</Box>
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-5">
				{activeTab === "upload" ? (
					<AdminVideoUpload
						onUploadSuccess={() => {
							// Optionally switch to gallery tab after successful upload
							setActiveTab("gallery");
						}}
					/>
				) : (
					<AdminVideoGallery
						showUploadButton={false}
						onVideoSelect={(video) => {
							console.log("Selected video:", video.title);
						}}
					/>
				)}
			</ScrollView>
		</View>
	);
}
