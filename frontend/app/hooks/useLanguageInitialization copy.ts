import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { initializeLanguage } from "@/i18n";
import { i18n } from "@/i18n";
import { setLanguage, LanguageEnum } from "../store/auth/authSlice";
import { AppDispatch } from "../store/store";

export const useLanguageInitialization = () => {
	const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);
	const isInitializingRef = useRef(false);
	const dispatch: AppDispatch = useDispatch();

	useEffect(() => {
		const initLanguage = async () => {
			// Prevent multiple simultaneous initializations
			if (isInitializingRef.current || isLanguageInitialized) {
				return;
			}
			isInitializingRef.current = true;

			try {
				const savedLanguage = await initializeLanguage();
				i18n.locale = savedLanguage;

				// Update Redux state to match the initialized language
				const languageEnum = savedLanguage as LanguageEnum;
				dispatch(setLanguage(languageEnum));

				setIsLanguageInitialized(true);
			} catch (error) {
				console.error("Error initializing language:", error);
				setIsLanguageInitialized(true); // Continue with default language
			} finally {
				isInitializingRef.current = false;
			}
		};

		initLanguage();
	}, [isLanguageInitialized, dispatch]);

	return isLanguageInitialized;
};
