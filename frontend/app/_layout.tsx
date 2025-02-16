import { Slot } from "expo-router";
import { Provider, useSelector } from "react-redux";
import { RootState, store } from "../store/store";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";

function ThemedApp() {
	const colorMode = useSelector(
		(state: RootState) => state.user.user?.settings?.theme ?? "light"
	);

	return (
		<>
			<GluestackUIProvider mode={colorMode}>
				<Slot />
			</GluestackUIProvider>
		</>
	);
}

export default function Layout() {
	return (
		<Provider store={store}>
			<ThemedApp />
		</Provider>
	);
}
