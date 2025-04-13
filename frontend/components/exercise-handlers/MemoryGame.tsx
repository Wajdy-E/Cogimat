import { useEffect, useState } from "react";
import { Exercise } from "../../store/data/dataSlice";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Color, ColorOption } from "../../data/program/Program";
export default function MemoryGame({ exercise }: { exercise: Exercise }) {
	const [sequence, setSequence] = useState<ColorOption[] | Color>([]);
	const [userInput, setUserInput] = useState<string[]>([]);

	useEffect(() => {
		// Generate random sequence
		const pool = exercise.parameters.colors ?? [];
		const randomSeq = Array.from({ length: 3 }, () => {
			const item = pool[Math.floor(Math.random() * pool.length)];
			return item as ColorOption; // Ensure the item is treated as ColorOption
		});
		setSequence(randomSeq);
	}, []);

	return (
		<View>
			<Text>Memorize this sequence:</Text>
			{sequence.map((item, i) => (
				<Text key={i}>{item}</Text>
			))}
		</View>
	);
}
