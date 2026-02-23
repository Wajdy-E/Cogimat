import { TouchableOpacity, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "@/components/ui/ThemeProvider";
import { i18n } from "../../i18n";

export default function AdminLayout() {
	const router = useRouter();
	const { themeBackgroundColor, themeTextColor } = useTheme();

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerStyle: {
					backgroundColor: themeBackgroundColor,
					borderBottomColor: themeTextColor,
					borderBottomWidth: 1,
				},
				headerTintColor: themeTextColor,
				headerTitleStyle: { fontWeight: "600" },
				headerLeft: () => (
					<TouchableOpacity
						onPress={() => router.back()}
						style={{ marginLeft: 8, padding: 8 }}
						accessibilityLabel={i18n.t("general.buttons.goBack")}
					>
						<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
							<ChevronLeft size={24} color={themeTextColor} />
						</View>
					</TouchableOpacity>
				),
			}}
		>
			<Stack.Screen
				name="video-management"
				options={{
					title: i18n.t("admin.videoManagement.title"),
				}}
			/>
			<Stack.Screen
				name="all-videos"
				options={{
					title: i18n.t("admin.allVideos.title"),
				}}
			/>
			<Stack.Screen
				name="qr-codes"
				options={{
					title: i18n.t("admin.qrCodes.title"),
				}}
			/>
		</Stack>
	);
}
