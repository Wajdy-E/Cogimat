import { View } from "react-native";
import CustomSelect from "../../components/CustomSelect";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store/store";
import { setTheme, Theme, setNotifications } from "../../store/auth/authSlice";
import { useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Switch } from "@/components/ui/switch";
import { VStack } from "@/components/ui/vstack";
import * as Notifications from "expo-notifications";
import { useTheme } from "@/components/ui/ThemeProvider";

function Settings() {
	const dispatch = useDispatch();
	const { theme, toggleTheme } = useTheme();
	const { notifications } = useSelector(
		(state: RootState) => ({
			notifications: state.user.user.settings?.allowNotifications ?? false,
		}),
		shallowEqual
	);

	const [notificationsEnabled, setNotificationsEnabled] = useState(notifications);

	function handleThemeChange(newTheme: string) {
		if (theme != newTheme) {
			toggleTheme();
			dispatch(setTheme(newTheme as Theme));
		}
	}

	async function askNotificationPermission() {
		const { status } = await Notifications.requestPermissionsAsync();
		return status === "granted";
	}

	async function updateNotificationSettings() {
		if (!notifications) {
			const permissionGranted = await askNotificationPermission();
			if (!permissionGranted) {
				setNotificationsEnabled(false);
				return;
			}
		}
		setNotificationsEnabled(!notificationsEnabled);
		dispatch(setNotifications(!notifications));
	}

	return (
		<View className="bg-background-700 h-screen">
			<View className="w-full flex justify-center items-center">
				<View className="w-[80%]">
					<VStack space="lg">
						<View className="flex-row justify-between">
							<Heading size="lg">Theme</Heading>
							<CustomSelect
								options={[
									{ label: "Light", value: "light" },
									{ label: "Dark", value: "dark" },
								]}
								placeholder="Select Theme"
								value={theme}
								onChange={handleThemeChange}
							/>
						</View>

						<View className="flex-row justify-between">
							<Heading size="lg">Notifications</Heading>
							<Switch onToggle={updateNotificationSettings} value={notificationsEnabled} />
						</View>
					</VStack>
				</View>
			</View>
		</View>
	);
}

export default Settings;
