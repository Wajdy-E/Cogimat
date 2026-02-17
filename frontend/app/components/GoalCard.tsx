import { View, Text, Pressable } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button, ButtonIcon } from '@/components/ui/button';

type GoalCardProps = {
	text: string;
	onDelete: () => void;
	onCheck: (checked: boolean) => void;
};

export default function GoalCard ({ text, onDelete, onCheck }: GoalCardProps) {
	const [checked, setChecked] = useState(false);

	return (
		<Card className="relative bg-background-500 border-2 border-outline-700 rounded-xl p-3" variant="outline" size="md">
			<Pressable
				onPress={() => {
					setChecked(!checked);
					onCheck(!checked);
				}}
				className="flex-row items-center gap-2"
			>
				<View
					className={`w-6 h-6 rounded-full border-2 ${
						checked ? 'bg-white border-white' : 'border-gray-500'
					} items-center justify-center`}
				>
					{checked && <Check size={14} color="#1C1C1E" />}
				</View>
				<Text className="text-typography-950 text-base">{text}</Text>
			</Pressable>

			<Button
				onPress={onDelete}
				className="absolute top-0 right-0 rounded-full p-2"
				variant="solid"
				action="negative"
				size="xs"
				style={{
					transform: [{ translateX: 12 }, { translateY: -12 }],
				}}
			>
				<ButtonIcon size="md" stroke="white" as={X} />
			</Button>
		</Card>
	);
}
