import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { GluestackUIProvider } from "./components/ui/gluestack-ui-provider";
import { I18nextProvider } from "react-i18next";
import i18n from "../i18n";

export default function Layout() {
	return (
		<GluestackUIProvider>
			<I18nextProvider i18n={i18n}>
				<Provider store={store}>
					<Slot />
				</Provider>
			</I18nextProvider>
		</GluestackUIProvider>
	);
}
