import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/components/ui/ThemeProvider";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { i18n } from "../i18n";

function BackButton(props: { classes?: string; showLabel?: boolean }) {
	const router = useRouter();
	const { themeTextColor } = useTheme();
	const className = props.classes ?? "mb-[20px]";

	if (props.showLabel) {
		return (
			<Pressable
				onPress={() => router.back()}
				className={`flex-row items-center gap-2 ${className}`}
				style={{ alignSelf: "flex-start" }}
			>
				<Ionicons name="caret-back-outline" size={24} color={themeTextColor} />
				<Text size="lg" style={{ color: themeTextColor }}>
					{i18n.t("general.buttons.goBack")}
				</Text>
			</Pressable>
		);
	}

	return (
		<Ionicons
			name="caret-back-outline"
			size={24}
			color={themeTextColor}
			onPress={() => router.back()}
			className={className}
		/>
	);
}

export default BackButton;
