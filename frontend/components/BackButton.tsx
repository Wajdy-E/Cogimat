import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "expo-router";

function BackButton() {
	const router = useRouter();
	return (
		<Button onPress={() => router.back()}>
			<Ionicons name="caret-back-outline" size={24} color="#000000" />
		</Button>
	);
}

export default BackButton;
