import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { i18n } from "../i18n";

interface LanguageAwareWrapperProps {
	children: React.ReactNode;
}

export const LanguageAwareWrapper: React.FC<LanguageAwareWrapperProps> = ({ children }) => {
	const currentLanguage = useSelector((state: RootState) => state.user.user.settings?.language);

	useEffect(() => {
		// Update i18n locale whenever Redux language state changes
		if (currentLanguage) {
			i18n.locale = currentLanguage;
		}
	}, [currentLanguage]);

	// Force re-render when language changes by using the language as a key
	return <React.Fragment key={currentLanguage || "en"}>{children}</React.Fragment>;
};
