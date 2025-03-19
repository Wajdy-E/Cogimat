import { Text, View } from "react-native";
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from "../components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { AppDispatch, persistor } from "../../store/store";

import * as ImagePicker from "expo-image-picker";
import React, { useState, useEffect } from "react";
import { Button, ButtonIcon, ButtonText } from "../../app/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccountOptions } from "@/ComponentsData";
import { RootState } from "../../store/store";
import { Stack, useRouter } from "expo-router";
import { ArrowRightIcon } from "../components/ui/icon";
import { Heading } from "@/components/ui/heading";
import { Trash2 } from "lucide-react-native";
import { setIsSignedIn } from "../../store/auth/authSlice";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { i18n } from "../../i18n";
import { createAction } from "@reduxjs/toolkit";
export const resetState = createAction("RESET_STATE");

function Account() {
	const router = useRouter();
	const theme = useSelector((state: RootState) => state.user.user.settings?.theme);
	const iconColor = theme === "dark" ? "#f8f487" : "#000000";
	const { signOut } = useClerk();

	const dispatch = useDispatch();

	const { user } = useUser();
	let emailAddress = "";
	if (user) {
		emailAddress = typeof user.emailAddresses === "string" ? user.emailAddresses : user.emailAddresses[0].emailAddress;
	}

	const [imageUri, setImageUri] = useState<string | null>(null);

	const requestPermission = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			alert("Sorry, we need camera roll permissions to make this work!");
		}
	};

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

	async function onSignOut() {
		dispatch(setIsSignedIn());
		await signOut();
		persistor.purge();
		dispatch(resetState());
		router.push("/AppLoaded");
	}

	useEffect(() => {
		if (!imageUri) {
			loadProfileImage();
		}
	}, []);

	return (
		<View className="bg-background-700">
			<View className="h-screen">
				<View className="items-center gap-2">
					<Button onPress={pickImage} size="xxl" className="rounded-full bg-transparent" variant="link">
						<Avatar size="2xl">
							{imageUri ? (
								<AvatarImage source={{ uri: imageUri }} alt="Profile Image" />
							) : (
								<AvatarFallbackText>
									{user?.firstName ? user.firstName.charAt(0).toUpperCase() : ""}{" "}
									{user?.lastName ? user.lastName.charAt(0).toUpperCase() : ""}
								</AvatarFallbackText>
							)}
							<AvatarBadge />
						</Avatar>
					</Button>
					{user?.firstName && <Heading size="xl">{user.firstName}</Heading>}
					{emailAddress.length > 0 && <Heading size="md">{emailAddress}</Heading>}
				</View>

				{AccountOptions && AccountOptions.length > 0 && (
					<VStack className="setting-options flex items-center justify-center w-full mt-[30px]" space="lg">
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

				<Button
					className="rounded-lg w-[80%] mt-5"
					onPress={() => router.navigate("../")}
					action="secondary"
					variant="solid"
					size="xl"
				>
					<ButtonIcon as={Trash2} stroke="red" />
					<ButtonText>{i18n.t("account.deleteAccount")}</ButtonText>
				</Button>

				<Button className="rounded-lg w-[80%] mt-5" onPress={onSignOut} action="secondary" variant="solid" size="xl">
					<ButtonIcon as={Trash2} stroke="red" />
					<ButtonText>{i18n.t("account.signout")}</ButtonText>
				</Button>
			</View>
		</View>
	);
}

export default Account;
