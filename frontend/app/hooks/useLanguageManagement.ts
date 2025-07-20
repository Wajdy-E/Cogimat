import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { i18n } from "@/i18n";
import { setLanguage, LanguageEnum } from "../store/auth/authSlice";
import { AppDispatch, RootState } from "../store/store";

const LANGUAGE_STORAGE_KEY = "app_language";

export const useLanguageManagement = () => {
	const dispatch: AppDispatch = useDispatch();
	const currentLanguage = useSelector((state: RootState) => state.user.user.settings?.language);

	const changeLanguage = useCallback(
		async (newLanguage: string) => {
			try {
				// Update i18n locale
				i18n.locale = newLanguage;

				// Save to AsyncStorage
				await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLanguage);

				// Update Redux state to trigger re-renders across the app
				const languageEnum = newLanguage as LanguageEnum;
				dispatch(setLanguage(languageEnum));
			} catch (error) {
				console.error("Error changing language:", error);
			}
		},
		[dispatch]
	);

	const getLanguageLabel = useCallback((locale: LanguageEnum) => {
		switch (locale) {
			case LanguageEnum.English:
				return i18n.t("account.english");
			case LanguageEnum.French:
				return i18n.t("account.français");
			case LanguageEnum.Japanese:
				return i18n.t("account.日本語");
			default:
				return i18n.t("account.english");
		}
	}, []);

	return {
		currentLanguage,
		changeLanguage,
		getLanguageLabel,
	};
};
