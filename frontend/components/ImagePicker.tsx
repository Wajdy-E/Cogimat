import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking, Platform } from "react-native";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { VStack } from "@/components/ui/vstack";
import { Camera } from "lucide-react-native";
import { i18n } from "../i18n";

type PickedImageData = {
	uri: string;
	name: string;
	type: string;
};

type ImagePickerProps = {
	onImagePicked?: (file: PickedImageData) => void;
	buttonText?: string;
	aspectX?: number;
	aspectY?: number;
};

export default function CustomImagePicker(props: ImagePickerProps) {
	const [imageUri, setImageUri] = useState<string | null>(null);

	const requestPermission = async () => {
		const { status, canAskAgain } = await ImagePicker.getMediaLibraryPermissionsAsync();

		if (status === "granted") {
			pickImage();
		} else if (canAskAgain) {
			const { status: newStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (newStatus === "granted") {
				pickImage();
			} else {
				alert(i18n.t("mediaPicker.permissionDenied"));
			}
		} else {
			Alert.alert(
				i18n.t("mediaPicker.permissionRequired"),
				i18n.t("mediaPicker.permissionMessage", { mediaType: "image" }),
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

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			quality: 1,
			aspect: [props.aspectX || 1, props.aspectY || 1],
		});

		if (!result.canceled) {
			const asset = result.assets[0];
			const uri = asset.uri;
			const name = uri.split("/").pop() ?? "image.jpg";
			const type = name.endsWith(".png") ? "image/png" : "image/jpeg";

			setImageUri(uri);

			props.onImagePicked?.({
				uri,
				name,
				type,
			});
		}
	};

	return (
		<VStack space="md" className="flex-row">
			<Button onPress={requestPermission} size="xxl" className="rounded-xl flex-col" action="primary" variant="outline">
				<ButtonIcon as={Camera} height={40} width={40} action="secondary" className="stroke-secondary-0" />
				<ButtonText className="text-center text-typography-950">
					{props.buttonText || i18n.t("mediaPicker.pickImage")}
				</ButtonText>
			</Button>
			{imageUri && (
				<Image source={{ uri: imageUri }} alt="Picked image" className="w-48 h-48 rounded-xl" resizeMode="contain" />
			)}
		</VStack>
	);
}
