import { useRouter } from "expo-router";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { ArrowRight } from "lucide-react-native";
interface NavigateTo {
	to?: string;
	text?: string;
	classes: string;
	heading?: string;
}
function NavigateTo(props: NavigateTo) {
	const router = useRouter();

	return (
		<View className={`${props.classes} flex-row gap-2 items-center`} style={{ marginVertical: 10 }}>
			{props.heading && <Heading className="text-typography-950">{props.heading}</Heading>}
			<Button onPress={() => (props.to ? router.push(props.to) : null)} variant="link">
				<ButtonText>{props.text && <Text size="lg">{props.text}</Text>}</ButtonText>
				<ButtonIcon as={ArrowRight} />
			</Button>
		</View>
	);
}

export default NavigateTo;
