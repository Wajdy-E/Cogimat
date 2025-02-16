import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

function BackButton() {
	const router = useRouter();
	const theme = useSelector(
		(state: RootState) => state.user.user.settings?.theme
	);
	const iconColor = theme === "dark" ? "#f8f487" : "#000000";
	return (
		<Button onPress={() => router.back()}>
			<Ionicons name="caret-back-outline" size={24} color={iconColor} />
		</Button>
	);
}

export default BackButton;
