import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";

export default function Layout() {
	return (
		<GluestackUIProvider>
			<Provider store={store}>
				<Slot />
			</Provider>
		</GluestackUIProvider>
	);
}
