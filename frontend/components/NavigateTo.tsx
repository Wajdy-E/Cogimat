import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { shallowEqual } from "react-redux";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
interface NavigateTo {
	to?: string;
	text?: string;
	classes: string;
	heading?: string;
}
function NavigateTo(props: NavigateTo) {
	const router = useRouter();
	const theme = useSelector((state: RootState) => state.user.user.settings?.theme, shallowEqual);
	const iconColor = theme === "dark" ? "#f8f487" : "#000000";
	return (
		<View className={`${props.classes} flex-row gap-2 items-center`} style={{ marginVertical: 10 }}>
			{props.heading && <Heading className="text-tertiary-500">{props.heading}</Heading>}
			<View className="flex-row">
				{props.text && <Text size="lg">{props.text}</Text>}
				<Ionicons
					name="caret-forward-outline"
					size={24}
					color={iconColor}
					onPress={() => (props.to ? router.push(props.to) : null)}
				/>
			</View>
		</View>
	);
}

export default NavigateTo;
