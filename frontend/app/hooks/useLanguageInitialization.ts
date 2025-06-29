import { useEffect, useState, useRef } from "react";
import { initializeLanguage } from "../../i18n";
import { i18n } from "../../i18n";

export const useLanguageInitialization = () => {
	const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);
	const isInitializingRef = useRef(false);

	useEffect(() => {
		const initLanguage = async () => {
			// Prevent multiple simultaneous initializations
			if (isInitializingRef.current || isLanguageInitialized) return;
			isInitializingRef.current = true;

			try {
				const savedLanguage = await initializeLanguage();
				i18n.locale = savedLanguage;
				setIsLanguageInitialized(true);
			} catch (error) {
				console.error("Error initializing language:", error);
				setIsLanguageInitialized(true); // Continue with default language
			} finally {
				isInitializingRef.current = false;
			}
		};

		initLanguage();
	}, [isLanguageInitialized]);

	return isLanguageInitialized;
};
