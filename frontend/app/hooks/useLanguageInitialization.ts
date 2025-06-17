import { useEffect, useState } from "react";
import { initializeLanguage } from "../../i18n";
import { i18n } from "../../i18n";

export const useLanguageInitialization = () => {
	const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);

	useEffect(() => {
		const initLanguage = async () => {
			try {
				const savedLanguage = await initializeLanguage();
				i18n.locale = savedLanguage;
				setIsLanguageInitialized(true);
			} catch (error) {
				console.error("Error initializing language:", error);
				setIsLanguageInitialized(true); // Continue with default language
			}
		};

		initLanguage();
	}, []);

	return isLanguageInitialized;
};
