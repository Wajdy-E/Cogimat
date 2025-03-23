import { Heading } from "@/components/ui/heading";
import { Switch } from "@/components/ui/switch";
import { View } from "react-native";

interface Props {
	title: string;
	value: boolean;
	onToggle: (value: boolean) => void;
}

export default function SwitchRow({ title, value, onToggle }: Props) {
	return (
		<View className="flex-row justify-between items-center">
			<Heading size="sm">{title}</Heading>
			<Switch value={value} onToggle={onToggle} size="sm" />
		</View>
	);
}
