import { View, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";

export default function AuthLoading() {
	return (
		<View className="flex-1 justify-center items-center bg-black">
			<ActivityIndicator size="large" color="#ffffff" />
			<Text className="text-white mt-4 text-lg">Loading...</Text>
		</View>
	);
}
