import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./locales/en.json";
import fr from "./locales/fr.json";

i18next.use(initReactI18next).init({
	compatibilityJSON: "v3",
	resources: { en: { translation: en }, fr: { translation: fr } },
	lng: "en",
	fallbackLng: "en",
	interpolation: { escapeValue: false },
	initImmediate: false,
	react: { useSuspense: false },
});

// Load saved language preference
AsyncStorage.getItem("language").then((lang) => {
	if (lang) {
		i18next.changeLanguage(lang);
	}
});

// Function to change language and save it
export const changeLanguage = async (lng) => {
	await AsyncStorage.setItem("language", lng);
	i18next.changeLanguage(lng);
};

export default i18next;
