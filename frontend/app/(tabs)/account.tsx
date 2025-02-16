import { SafeAreaView, Text } from "react-native";
import { View } from "react-native";
import {
	Avatar,
	AvatarBadge,
	AvatarFallbackText,
	AvatarImage,
} from "../components/ui/avatar";
import { useSelector } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect, useMemo } from "react";
import { Button, ButtonText } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountOptions } from "@/ComponentsData";
import { Link } from "@/components/ui/link";
import { Ionicons } from "@expo/vector-icons";
import { RootState } from "../../store/store";
import { useRouter } from "expo-router";

function Account() {
	const router = useRouter();
	const theme = useSelector(
		(state: RootState) => state.user.user.settings?.theme
	);
	const iconColor = theme === "dark" ? "#f8f487" : "#000000";

	const { firstName, lastName, username } = useSelector((state: RootState) =>
		useMemo(
			() => ({
				firstName: state.user.user.baseInfo?.firstName,
				lastName: state.user.user.baseInfo?.lastName,
				username: state.user.user.baseInfo?.username,
			}),
			[state.user.user.baseInfo]
		)
	);

	const [imageUri, setImageUri] = useState<string | null>(null);

	const requestPermission = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			alert("Sorry, we need camera roll permissions to make this work!");
		}
	};

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 1,
		});

		if (!result.canceled && result.assets && result.assets.length > 0) {
			const selectedUri = result.assets[0].uri;
			setImageUri(selectedUri);
			await AsyncStorage.setItem("profileImageUri", selectedUri);
		}
	};

	const loadProfileImage = async () => {
		try {
			const storedImageUri = await AsyncStorage.getItem("profileImageUri");
			if (storedImageUri) {
				setImageUri(storedImageUri);
			}
		} catch (error) {
			console.error("Failed to load profile image from AsyncStorage", error);
		}
	};

	useEffect(() => {
		requestPermission();
		loadProfileImage();
	}, []);

	return (
		<SafeAreaProvider>
			<SafeAreaView>
				<View className="h-screen">
					<View className="items-center">
						<Button onPress={pickImage} size="xxl" className="rounded-full">
							<Avatar size="2xl">
								{imageUri ? (
									<AvatarImage source={{ uri: imageUri }} alt="Profile Image" />
								) : (
									<AvatarFallbackText>
										{firstName && firstName.length > 0
											? firstName.charAt(0).toUpperCase()
											: ""}{" "}
										{lastName && lastName.length > 0
											? lastName.charAt(0).toUpperCase()
											: ""}
									</AvatarFallbackText>
								)}
								<AvatarBadge />
							</Avatar>
						</Button>
						<Text className="mt-2 text-lg">{username}</Text>
					</View>

					{AccountOptions && AccountOptions.length > 0 && (
						<View className="setting-options flex items-center justify-center w-full gap-3">
							{AccountOptions.map((page, index) => {
								return (
									<Button
										className="bg-background-400 p-6 rounded-lg flex-row justify-between"
										key={`${page.title}-${index}`}
										style={{ width: "80%" }}
										onPress={() => router.navigate(page.link)}
									>
										<ButtonText className="w-[80%] text-secondary-0">
											{page.title}
										</ButtonText>
										<Ionicons
											name="caret-forward-outline"
											size={18}
											color={iconColor}
										/>
									</Button>
								);
							})}
						</View>
					)}
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

export default Account;
