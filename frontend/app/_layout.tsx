import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import { useState } from "react";

export default function Layout() {
	const [colorMode, setColorMode] = useState<"light" | "dark">("light");
	return (
		<GluestackUIProvider mode={colorMode}>
			<Provider store={store}>
				<Slot />
			</Provider>
		</GluestackUIProvider>
	);
}
