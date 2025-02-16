import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

export const resources = {
	fr: { translation: fr },
	en: { translation: en },
};

i18n.use(initReactI18next).init({
	compatibilityJSON: "v3",
	resources: resources,
	lng: "en",
	fallbackLng: "en",
});

export default i18n;
