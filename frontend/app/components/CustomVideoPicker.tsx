import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useVideoPlayer, VideoView } from "expo-video";
import { VideoIcon, X } from "lucide-react-native";
import { i18n } from "../i18n";

type PickedVideoData = {
	uri: string;
	name: string;
	type: string;
};

type VideoPickerProps = {
	onVideoPicked?: (file: PickedVideoData) => void;
	onVideoRemoved?: () => void;
	value?: string;
	buttonText?: string;
};

export default function CustomVideoPicker(props: VideoPickerProps) {
	const [videoUri, setVideoUri] = useState<string | null>(props.value ?? null);

	useEffect(() => {
		if (props.value === "") {
			setVideoUri(null);
		} else if (props.value) {
			setVideoUri(props.value);
		}
	}, [props.value]);

	const handleRemove = () => {
		setVideoUri(null);
		props.onVideoRemoved?.();
	};

	const requestPermission = async () => {
		const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

		if (status === "granted") {
			pickVideo();
		} else if (canAskAgain) {
			const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (newStatus === "granted") {
				pickVideo();
			} else {
				alert(i18n.t("mediaPicker.permissionDenied"));
			}
		} else {
			Alert.alert(
				i18n.t("mediaPicker.permissionRequired"),
				i18n.t("mediaPicker.permissionMessage", { mediaType: "video" }),
				[
					{ text: i18n.t("mediaPicker.cancel"), style: "cancel" },
					{
						text: i18n.t("mediaPicker.openSettings"),
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
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["videos"],
				allowsEditing: false,
				quality: 1,
				videoExportPreset: ImagePicker.VideoExportPreset.Passthrough,
				...(Platform.OS === "ios" && {
					preferredAssetRepresentationMode:
						ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Current,
				}),
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
		} catch (error: any) {
			const msg = error?.message ?? String(error);
			const isICloudError =
				Platform.OS === "ios" &&
				(msg.includes("3164") || msg.includes("PHPhotosErrorDomain") || msg.includes("network access"));

			Alert.alert(
				i18n.t("mediaPicker.videoPickFailed"),
				isICloudError ? i18n.t("mediaPicker.iCloudVideoError") : msg
			);
		}
	};

	const player = useVideoPlayer(videoUri ?? null, (player) => {
		player.loop = true;
		player.play();
	});

	return (
		<VStack space="md">
			<Button
				onPress={requestPermission}
				size="xxl"
				className="rounded-xl flex-col border-secondary-0"
				action="secondary"
				variant="outline"
			>
				<ButtonIcon as={VideoIcon} height={40} width={40} action="secondary" className="stroke-secondary-0" />
				<ButtonText className="text-center text-typography-950">
					{props.buttonText || i18n.t("mediaPicker.pickVideo")}
				</ButtonText>
			</Button>
			{videoUri && (
				<>
					<VStack space="sm">
						<VideoView
							player={player}
							fullscreenOptions={{ enable: true }}
							allowsPictureInPicture
							style={{ maxWidth: "100%", width: "100%", height: 200, borderRadius: 12 }}
							contentFit="cover"
						/>
						<Button
							onPress={handleRemove}
							size="md"
							variant="outline"
							action="secondary"
							className="self-start"
						>
							<ButtonIcon as={X} size="sm" />
							<ButtonText>{i18n.t("mediaPicker.removeVideo")}</ButtonText>
						</Button>
					</VStack>
				</>
			)}
		</VStack>
	);
}
