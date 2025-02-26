import { SafeAreaView, Text, View } from "react-native";
import {
	Avatar,
	AvatarBadge,
	AvatarFallbackText,
	AvatarImage,
} from "../components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { useSelector } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect, useMemo } from "react";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountOptions } from "@/ComponentsData";
import { RootState } from "../../store/store";
import { useRouter } from "expo-router";
import { ArrowRightIcon } from "../components/ui/icon";
function Account() {
	const router = useRouter();
	const theme = useSelector(
		(state: RootState) => state.user.user.settings?.theme
	);
	const iconColor = theme === "dark" ? "#f8f487" : "#000000";

	const { firstName, lastName, username } = useSelector((state: RootState) => ({
		firstName: state.user.user.baseInfo?.firstName,
		lastName: state.user.user.baseInfo?.lastName,
		username: state.user.user.baseInfo?.username,
	}));

	const [imageUri, setImageUri] = useState<string | null>(null);

	const requestPermission = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			alert("Sorry, we need camera roll permissions to make this work!");
		}
	};

	useEffect(() => {
		requestPermission();
	}, []);

	const pickImage = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 1,
			});

			if (result.canceled || !result.assets || result.assets.length === 0) {
				return;
			}

			const selectedUri = result.assets[0].uri;
			await AsyncStorage.setItem("profileImageUri", selectedUri);
			setImageUri(selectedUri);
		} catch (error) {
			console.error("Error picking image:", error);
		}
	};

	const loadProfileImage = async () => {
		try {
			const storedImageUri = await AsyncStorage.getItem("profileImageUri");
			if (storedImageUri) {
				setImageUri(storedImageUri);
			}
		} catch (error) {
			console.error("Error loading profile image:", error);
		}
	};

	useEffect(() => {
		if (!imageUri) {
			loadProfileImage();
		}
	}, []);

	return (
		<SafeAreaProvider>
			<SafeAreaView className="bg-background-500 h-screen">
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
						<VStack
							className="setting-options flex items-center justify-center w-full"
							space="lg"
						>
							{AccountOptions.map((page, index) => {
								return (
									<Button
										className="rounded-lg flex-row justify-between w-[80%]"
										key={`${page.title}-${index}`}
										onPress={() => router.navigate(page.link)}
										action="secondary"
										variant="solid"
										size="xl"
									>
										<ButtonText>{page.title}</ButtonText>
										<ButtonIcon as={ArrowRightIcon} />
									</Button>
								);
							})}
						</VStack>
					)}
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	);
}

export default Account;
