import "../global.css";
import { Stack, Tabs } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "../store/store";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import { PersistGate } from "redux-persist/integration/react";
import { ClerkProvider, ClerkLoaded, SignedIn, SignedOut, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "../cache";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./components/ui/ThemeProvider";
import { useEffect } from "react";
import { Platform, SafeAreaView } from "react-native";
import Purchases from "react-native-purchases";
import { useLanguageInitialization } from "./hooks/useLanguageInitialization";
import LoadingOverlay from "../components/LoadingOverlay";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import backgroundNotificationService from "../lib/backgroundNotificationService";
import { setupNotifications } from "../lib/notificationSetup";
import { LanguageAwareWrapper } from "../components/LanguageAwareWrapper";

const publishableKey = process.env.CLERK_PROD_KEY!;

function ThemedApp() {
	const { theme } = useTheme();
	const isLanguageInitialized = useLanguageInitialization();
	const router = useRouter();
	const { isSignedIn } = useAuth();

	// Handle notification responses and reschedule notifications on app start
	useEffect(() => {
		// Set up notifications and reschedule all notifications when app starts
		const initializeNotifications = async () => {
			try {
				await setupNotifications();
				await backgroundNotificationService.rescheduleAllNotifications();
			} catch (error) {
				console.log("Notification setup failed, continuing without notifications:", error);
			}
		};

		initializeNotifications();

		const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
			const data = response.notification.request.content.data;

			if (data?.type === "weekly_workout") {
				// Navigate to exercises tab when user taps workout reminder
				router.push("/(tabs)/all-exercises");

				// Reschedule future notifications to ensure continuity
				try {
					await backgroundNotificationService.rescheduleAllNotifications();
				} catch (error) {
					console.log("Error rescheduling notifications after tap:", error);
				}
			}
		});

		return () => subscription.remove();
	}, [router]);

	// Don't render until language is initialized
	if (!isLanguageInitialized) {
		return null; // Or a loading screen
	}

	console.log("isSignedIn", isSignedIn);
	return (
		<LanguageAwareWrapper>
			<GluestackUIProvider mode={theme}>
				<SignedIn>
					<Tabs
						screenOptions={{
							animation: "fade",
							headerShown: false,
							tabBarStyle: {
								display: "none",
							},
						}}
					/>
					<LoadingOverlay />
				</SignedIn>

				<SignedOut>
					<Stack screenOptions={{ headerShown: false }} initialRouteName="index">
						<Stack.Screen name="index" options={{ headerShown: false }} />
						<Stack.Screen name="login" options={{ headerShown: false }} />
						<Stack.Screen name="signup" options={{ headerShown: false }} />
						<Stack.Screen name="ForgotPassword" options={{ headerShown: false }} />
					</Stack>
				</SignedOut>
			</GluestackUIProvider>
		</LanguageAwareWrapper>
	);
}

export default function Layout() {
	useEffect(() => {
		Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

		if (Platform.OS === "ios") {
			Purchases.configure({ apiKey: process.env.IOS_REVENUECAT_KEY });
		} else if (Platform.OS === "android") {
			Purchases.configure({ apiKey: process.env.ANDROID_REVENUECAT_KEY });
		}
	}, []);

	return (
		<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
			<ClerkLoaded>
				<Provider store={store}>
					<PersistGate loading={null} persistor={persistor}>
						<SafeAreaProvider>
							<ThemeProvider>
								<ThemedApp />
							</ThemeProvider>
						</SafeAreaProvider>
					</PersistGate>
				</Provider>
			</ClerkLoaded>
		</ClerkProvider>
	);
}
