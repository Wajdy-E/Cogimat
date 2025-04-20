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

const publishableKey = process.env.CLERK_PROD_KEY!;
function ThemedApp() {
	const { theme } = useTheme();

	return (
		<GluestackUIProvider mode={theme}>
			<SafeAreaProvider>
				<Stack
					screenOptions={{
						animation: "fade",
						headerShown: false,
					}}
				/>
			</SafeAreaProvider>
		</GluestackUIProvider>
	);
}

export default function Layout() {
	useEffect(() => {
		Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

		if (Platform.OS === "ios") {
			Purchases.configure({ apiKey: "appl_oaZgMRHYuPQbxdagqiyBGOKFpEB" });
		} else if (Platform.OS === "android") {
			Purchases.configure({ apiKey: "your_revenuecat_google_sdk_key" });
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
