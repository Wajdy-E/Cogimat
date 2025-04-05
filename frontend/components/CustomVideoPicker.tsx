import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform, View } from "react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useVideoPlayer, VideoView } from "expo-video";
import { VideoIcon } from "lucide-react-native";

type PickedVideoData = {
	uri: string;
	name: string;
	type: string;
};

type VideoPickerProps = {
	onVideoPicked?: (file: PickedVideoData) => void;
	buttonText?: string;
};

export default function CustomVideoPicker(props: VideoPickerProps) {
	const [videoUri, setVideoUri] = useState<string | null>(null);

	const requestPermission = async () => {
		const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

		if (status === "granted") {
			pickVideo();
		} else if (canAskAgain) {
			const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (newStatus === "granted") {
				pickVideo();
			} else {
				alert("Permission to access media library is required!");
			}
		} else {
			Alert.alert(
				"Permission Required",
				"To select a video, please enable media library access in your device settings.",
				[
					{ text: "Cancel", style: "cancel" },
					{
						text: "Open Settings",
						onPress: () => {
							if (Platform.OS === "ios") {
								Linking.openURL("app-settings:");
							} else {
								Linking.openSettings();
							}
						},
					},
				]
			);
		}
	};

	const pickVideo = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["videos"],
			allowsEditing: false,
			quality: 1,
			aspect: [3, 2],
		});

		if (!result.canceled) {
			const asset = result.assets[0];
			const uri = asset.uri;
			const name = uri.split("/").pop() ?? "video.mp4";
			const type = "video/mp4";

			setVideoUri(uri);

			props.onVideoPicked?.({
				uri,
				name,
				type,
			});
		}
	};

	const player = useVideoPlayer(videoUri ?? null, (player) => {
		player.loop = true;
		player.play();
	});

	return (
		<VStack space="md">
			<Button onPress={requestPermission} size="xxl" className="rounded-xl flex-col" action="secondary">
				<ButtonIcon as={VideoIcon} height={40} width={40} action="secondary" className="stroke-secondary-0" />
				<ButtonText className="text-center text-typography-950">{props.buttonText || "Pick a video"}</ButtonText>
			</Button>
			{videoUri && (
				<>
					<VideoView
						player={player}
						allowsFullscreen
						allowsPictureInPicture
						style={{ maxWidth: "100%", width: "100%", height: 200, borderRadius: 12 }}
						contentFit="cover"
					/>
				</>
			)}
		</VStack>
	);
}
