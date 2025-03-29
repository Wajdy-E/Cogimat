import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/ui/ThemeProvider";

function BackButton(props: { classes?: string }) {
	const router = useRouter();
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
