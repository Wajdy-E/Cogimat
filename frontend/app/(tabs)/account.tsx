import React, { useState, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from "../components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { AppDispatch, persistor } from "../../store/store";
import * as ImagePicker from "expo-image-picker";
import { Button } from "../../app/components/ui/button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootState } from "../../store/store";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { setIsSignedIn, setNotifications, setTheme, Theme } from "../../store/auth/authSlice";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { i18n } from "../../i18n";
import { createAction } from "@reduxjs/toolkit";
import AccountLink from "../../components/AccountLink";
import { Divider } from "@/components/ui/divider";
import { useTheme } from "@/components/ui/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { Center } from "@/components/ui/center";
import SwitchRow from "../../components/SwitchRow";
import { Box } from "@/components/ui/box";

export const resetState = createAction("RESET_STATE");

function Account() {
	const router = useRouter();
	const { signOut } = useClerk();
	const dispatch = useDispatch();
	const { user } = useUser();

	let emailAddress = "";
	if (user) {
		emailAddress = typeof user.emailAddresses === "string" ? user.emailAddresses : user.emailAddresses[0].emailAddress;
	}

	const [imageUri, setImageUri] = useState<string | null>(null);
	const { theme, toggleTheme } = useTheme();
	const { notifications } = useSelector(
		(state: RootState) => ({
			notifications: state.user.user.settings?.allowNotifications ?? false,
		}),
		shallowEqual
	);

	async function askNotificationPermission() {
		const { status } = await Notifications.requestPermissionsAsync();
		return status === "granted";
	}

	async function updateNotificationSettings() {
		if (!notifications) {
			const permissionGranted = await askNotificationPermission();
			if (!permissionGranted) return;
		}
		dispatch(setNotifications(!notifications));
	}

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
		<ScrollView className="bg-background-700">
			<View className="mt-5">
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
					<View className="flex-row gap-2">
						{user?.firstName && <Heading size="xl">{user.firstName}</Heading>}
						{user?.lastName && <Heading size="xl">{user.lastName}</Heading>}
					</View>
				</View>

				<VStack className="flex justify-center w-full p-5" space="4xl" style={{ marginBlock: 30 }}>
					<VStack space="md">
						<Heading className="text-primary-500">{i18n.t("account.title")}</Heading>
						<Divider className="bg-secondary-100" />
						<View className="flex-row justify-between w-full">
							<Heading size="sm">{i18n.t("account.email")}</Heading>
							{emailAddress.length > 0 && <Heading size="sm">{emailAddress}</Heading>}
						</View>
						<AccountLink title="account.subscribe" link="unknown" isExternal />
						<AccountLink title="account.subscriptionCode" link="unknown" isExternal />
						<AccountLink title="account.viewReport" link="unknown" isExternal />
						<AccountLink title="account.signout" isExternal onPress={onSignOut} />
						<AccountLink title="account.askTeam" link="unknown" isExternal />
					</VStack>

					<VStack space="md">
						<Heading className="text-primary-500">{i18n.t("account.appSettings")}</Heading>
						<SwitchRow
							title={i18n.t("account.notifications")}
							value={notifications}
							onToggle={updateNotificationSettings}
						/>
						<SwitchRow
							title={i18n.t("account.darkMode")}
							value={theme === Theme.Dark}
							onToggle={() => {
								setTimeout(() => {
									toggleTheme();
								}, 1);
							}}
						/>
					</VStack>

					<VStack space="md">
						<Heading className="text-primary-500">{i18n.t("account.help")}</Heading>
						<AccountLink title="account.billingHelp" link="unknown" isExternal />
						<AccountLink title="account.contactSupport" link="unknown" isExternal />
						<AccountLink title="account.restore" link="unknown" isExternal />
						<AccountLink title="account.deleteAccount" link="unknown" isExternal />
					</VStack>

					<VStack space="md">
						<Heading className="text-primary-500">{i18n.t("account.legal")}</Heading>
						<AccountLink title="account.terms" link="unknown" isExternal />
						<AccountLink title="account.privacy" link="unknown" isExternal />
						<View className="flex-row justify-between w-full">
							<Heading size="sm">{i18n.t("account.version")}</Heading>
							<Heading size="sm">1.0</Heading>
						</View>
					</VStack>
					<Center>
						<Text>COGIPRO, INC.</Text>
					</Center>
				</VStack>
			</View>
		</ScrollView>
	);
}

export default Account;
