import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { shallowEqual } from "react-redux";
import { useTheme } from "@/components/ui/ThemeProvider";

function BackButton(props: { classes?: string }) {
	const router = useRouter();
	const theme = useSelector((state: RootState) => state.user.user.settings?.theme, shallowEqual);
	const { themeTextColor } = useTheme();
	return (
		<Ionicons
			name="caret-back-outline"
			size={24}
			color={themeTextColor}
			onPress={() => router.back()}
			className={`${props.classes ? props.classes : "mb-[20px]"}`}
		/>
	);
}

export default BackButton;
