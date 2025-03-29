import { HStack } from "@/components/ui/hstack";
import { letterOptions } from "../../data/program/Program";
import { Button, ButtonText } from "@/components/ui/button";
import { useState, useEffect } from "react";

type LettersProps = {
	onChange?: (selected: string[]) => void;
};

function Letters({ onChange }: LettersProps) {
	const [selectedLetters, setSelectedLetters] = useState<string[]>([]);

	const toggleLetter = (letter: string) => {
		setSelectedLetters((prev) => (prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]));
	};

	// Notify parent when selection changes
	useEffect(() => {
		onChange?.(selectedLetters);
	}, [selectedLetters]);

	return (
		letterOptions.length > 0 && (
			<HStack space="4xl">
				{letterOptions.map((letter) => (
					<Button
						key={letter}
						onPress={() => toggleLetter(letter)}
						className="flex items-center justify-center p-0"
						variant="link"
					>
						<ButtonText
							className={`h-10 w-10 text-center text-4xl ${
								selectedLetters.includes(letter) ? "text-primary-500" : "text-white"
							}`}
						>
							{letter}
						</ButtonText>
					</Button>
				))}
			</HStack>
		)
	);
}

export default Letters;
