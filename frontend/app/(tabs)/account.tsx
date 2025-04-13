import React, { useState, useEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { createAction } from "@reduxjs/toolkit";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { AppDispatch, persistor, RootState } from "../../store/store";
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from "../components/ui/avatar";
import { VStack } from "@/components/ui/vstack";
import { Button, ButtonIcon, ButtonText } from "../../app/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import AccountLink from "../../components/AccountLink";
import { Divider } from "@/components/ui/divider";
import { Center } from "@/components/ui/center";
import SwitchRow from "../../components/SwitchRow";
import AlertModal from "../../components/AlertModal";
import { i18n } from "../../i18n";
import { setNotifications, Theme } from "../../store/auth/authSlice";
import { useTheme } from "@/components/ui/ThemeProvider";
import { deleteUserThunk } from "../../store/auth/authSaga";
import { Pencil } from "lucide-react-native";
import ModalComponent from "../../components/Modal";
import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";

export const resetState = createAction("RESET_STATE");

function Account() {
	const router = useRouter();
	const dispatch = useDispatch();
	const appDispatch: AppDispatch = useDispatch();
	const { signOut } = useClerk();
	const { user } = useUser();

	let emailAddress = "";
	if (user) {
		emailAddress = typeof user.emailAddresses === "string" ? user.emailAddresses : user.emailAddresses[0].emailAddress;
	}

	const [showSignoutModal, setShowSignoutModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showUsernameModal, setShowUsernameModal] = useState(false);
	const [username, setUsername] = useState<string>(user?.username ?? "");
	const { theme, toggleTheme, themeTextColor } = useTheme();
	const { notifications } = useSelector(
		(state: RootState) => ({
			notifications: state.user.user.settings?.allowNotifications ?? false,
		}),
		shallowEqual
	);

	const [selectedLanguage, setSelectedLanguage] = useState(i18n.locale);
	const languageOptions = useMemo(
		() => [
			{ label: "account.english", value: "en" },
			{ label: "account.français", value: "fr" },
			{ label: "account.日本語", value: "ja" },
		],
		[]
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
				allowsEditing: true,
				aspect: [4, 4],
				quality: 0.1,
				base64: true,
			});
			if (result.canceled || !result.assets || result.assets.length === 0 || !result.assets[0].base64) return;
			const base64 = result.assets[0].base64;
			const mimeType = result.assets[0].mimeType;

			const image = `data:${mimeType};base64,${base64}`;
			await user?.setProfileImage({
				file: image,
			});
		} catch (error) {
			console.error("Error picking image:", error);
		}
	};

	async function handleSignOut() {
		setShowSignoutModal(false);
		await signOut();
		persistor.purge();
		dispatch(resetState());
		router.push("/AppLoaded");
	}

	async function handleAccountDeletion() {
		setShowDeleteModal(false);
		if (user?.id) {
			appDispatch(deleteUserThunk(user.id));
			await signOut();
			persistor.purge();
			dispatch(resetState());
			router.push("/AppLoaded");
		}
	}

	async function updateUsername() {
		if (user) await user.update({ username: username });
		setShowUsernameModal(false);
	}

	return (
		<ScrollView className="bg-background-700">
			<View className="mt-5">
				<View className="items-center gap-2">
					<Button onPress={pickImage} size="xxl" className="rounded-full bg-transparent" variant="link">
						<Avatar size="2xl">
							{user?.imageUrl ? (
								<AvatarImage source={{ uri: user.imageUrl }} alt="Profile Image" />
							) : (
								<AvatarFallbackText>
									{user?.firstName ? user.firstName.charAt(0).toUpperCase() : ""}{" "}
									{user?.lastName ? user.lastName.charAt(0).toUpperCase() : ""}
								</AvatarFallbackText>
							)}
							<AvatarBadge />
						</Avatar>
					</Button>
					<Button variant="link" onPress={() => setShowUsernameModal(true)}>
						{user?.username ? (
							<ButtonText size="xl" className="text-typography-950">
								{user.username}
							</ButtonText>
						) : (
							<ButtonText size="xl" className="underline text-typography-950">
								Enter username...
							</ButtonText>
						)}
						<ButtonIcon as={Pencil} stroke={themeTextColor} />
					</Button>
				</View>
				<VStack className="flex justify-center w-full p-5" space="4xl" style={{ marginBlock: 30 }}>
					<VStack space="md">
						<Heading className="text-primary-500">{i18n.t("account.title")}</Heading>
						<Divider className="bg-secondary-100" />
						<View className="flex-row justify-between w-full">
							<Heading size="sm">{i18n.t("account.email")}</Heading>
							{emailAddress.length > 0 && <Heading size="sm">{emailAddress}</Heading>}
						</View>
						<AccountLink title="account.subscribe" link="unknown" />
						<AccountLink title="account.subscriptionCode" link="unknown" />
						<AccountLink title="account.viewReport" link="unknown" />
						<AccountLink title="account.signout" onPress={() => setShowSignoutModal(true)} />
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
						<SwitchRow
							title={i18n.t("account.emailMarketing")}
							value={notifications}
							onToggle={() => {
								setTimeout(() => updateNotificationSettings(), 2);
							}}
						/>

						<FormSelect
							size="lg"
							label="account.appLanguage"
							value={selectedLanguage}
							variant="outline"
							onValueChange={(value) => setSelectedLanguage(value)}
							options={languageOptions}
							title="account.appLanguage"
							selectedValue={selectedLanguage}
							displayAsRow
						/>
					</VStack>
					<VStack space="md">
						<Heading className="text-primary-500">{i18n.t("account.help")}</Heading>
						<AccountLink title="account.billingHelp" link="unknown" isExternal />
						<AccountLink title="account.contactSupport" link="unknown" isExternal />
						<AccountLink title="account.restore" link="unknown" />
						<AccountLink title="account.deleteAccount" onPress={() => setShowDeleteModal(true)} />
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
			<AlertModal
				isOpen={showSignoutModal}
				onClose={() => setShowSignoutModal(false)}
				onConfirm={handleSignOut}
				headingKey="account.signOutConfirm"
				buttonKey="account.signout"
				cancelKey={undefined}
			/>
			<AlertModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleAccountDeletion}
				headingKey="account.deleteAccountConfirm"
				buttonKey="account.deleteAccount"
				cancelKey={undefined}
				action="negative"
			/>

			<ModalComponent onClose={() => setShowUsernameModal(false)} isOpen={showUsernameModal} onConfirm={updateUsername}>
				<FormInput
					formSize="md"
					label="Username"
					placeholder={user?.username ?? ""}
					inputType="text"
					inputSize="md"
					onChange={(text) => setUsername(text)}
					value={username}
				/>
			</ModalComponent>
		</ScrollView>
	);
}

export default Account;
