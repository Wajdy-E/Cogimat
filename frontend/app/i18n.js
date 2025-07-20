import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ja from "./locales/ja.json";

const LANGUAGE_STORAGE_KEY = "app_language";

// Function to initialize language from storage
export const initializeLanguage = async () => {
	try {
		const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
		if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr" || savedLanguage === "ja")) {
			return savedLanguage;
		}
	} catch (error) {
		console.error("Error loading saved language:", error);
	}

	// Fallback to device locale or English
	const deviceLocale = getLocales()[0].languageCode;
	if (deviceLocale === "fr" || deviceLocale === "ja") {
		return deviceLocale;
	}
	return "en";
};

const translations = {
	en,
	fr,
	ja,
};
export const i18n = new I18n(translations);

// Initialize with device locale, will be updated by initializeLanguage() when called
i18n.locale = getLocales()[0].languageCode ?? "en";

i18n.enableFallback = true;
