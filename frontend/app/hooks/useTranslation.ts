import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { i18n } from "@/i18n";

export const useTranslation = () => {
	// Subscribe to language changes in Redux to force re-renders
	const currentLanguage = useSelector((state: RootState) => state.user.user.settings?.language);

	// Return the i18n.t function and current language
	return {
		t: i18n.t.bind(i18n),
		locale: currentLanguage || "en",
	};
};
