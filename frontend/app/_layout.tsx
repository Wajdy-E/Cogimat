import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "../store/store";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import { PersistGate } from "redux-persist/integration/react";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "../cache";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./components/ui/ThemeProvider";
import { useEffect } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import { useLanguageInitialization } from "./hooks/useLanguageInitialization";
import LoadingOverlay from "../components/LoadingOverlay";

const publishableKey = process.env.CLERK_PROD_KEY!;

function ThemedApp() {
	const { theme } = useTheme();
	const isLanguageInitialized = useLanguageInitialization();

	// Don't render until language is initialized
	if (!isLanguageInitialized) {
		return null; // Or a loading screen
	}

	return (
		<GluestackUIProvider mode={theme}>
			<SafeAreaProvider>
				<Stack
					screenOptions={{
						animation: "fade",
						headerShown: false,
					}}
				/>
				<LoadingOverlay />
			</SafeAreaProvider>
		</GluestackUIProvider>
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
						<ThemeProvider>
							<ThemedApp />
						</ThemeProvider>
					</PersistGate>
				</Provider>
			</ClerkLoaded>
		</ClerkProvider>
	);
}
