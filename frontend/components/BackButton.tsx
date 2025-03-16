import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { shallowEqual } from "react-redux";

function BackButton(props: { classes?: string }) {
	const router = useRouter();
	const theme = useSelector((state: RootState) => state.user.user.settings?.theme, shallowEqual);
	const iconColor = theme === "dark" ? "#f8f487" : "#000000";
	return (
		<Ionicons
			name="caret-back-outline"
			size={24}
			color={iconColor}
			onPress={() => router.back()}
			className={`${props.classes ? props.classes : "mb-[20px]"}`}
		/>
	);
}

export default BackButton;
