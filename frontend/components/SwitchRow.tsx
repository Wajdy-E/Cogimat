import { Heading } from "@/components/ui/heading";
import { View } from "react-native";
import AnimatedSwitch from "./AnimatedSwitch";

interface Props {
	title: string;
	value: boolean;
	onToggle: (value: boolean) => void;
}

export default function SwitchRow({ title, value, onToggle }: Props) {
	return (
		<View className="flex-row justify-between items-center">
			<Heading size="sm">{title}</Heading>
			<AnimatedSwitch defaultValue={value} onChange={onToggle} width={50} height={20} thumbSize={15} />
		</View>
	);
}
