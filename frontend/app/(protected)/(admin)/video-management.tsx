import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { Upload, Video } from "lucide-react-native";
import AdminVideoUpload from "@/components/AdminVideoUpload";
import AdminVideoGallery from "@/components/AdminVideoGallery";
import { i18n } from "../../i18n";

export default function AdminVideoManagement() {
	const router = useRouter();
	const user = useSelector((state: RootState) => state.user.user.baseInfo);
	const [activeTab, setActiveTab] = useState<"upload" | "gallery">("gallery");

	// Redirect if not admin
	if (!user?.isAdmin) {
		router.replace("/(tabs)/home");
		return null;
	}

	return (
		<View className="bg-background-800 h-screen">
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
