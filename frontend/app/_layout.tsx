import { Stack } from "expo-router";
import { Provider, useSelector, shallowEqual } from "react-redux";
import { RootState, store, persistor } from "../store/store";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import { PersistGate } from "redux-persist/integration/react";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import { tokenCache } from "../cache";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./components/ui/ThemeProvider";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

function ThemedApp() {
	const { theme } = useTheme();

	return (
		<GluestackUIProvider mode={theme} key={theme}>
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
