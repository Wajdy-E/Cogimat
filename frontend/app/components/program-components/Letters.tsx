import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { letterOptions } from "../../data/program/Program";
import { Button, ButtonText } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Checkbox, CheckboxIcon, CheckboxIndicator } from "@/components/ui/checkbox";
import { CheckIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { i18n } from "../../i18n";

type LettersProps = {
	onChange?: (selected: string[]) => void;
};

function Letters({ onChange }: LettersProps) {
	const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
	const [showAll, setShowAll] = useState(false);

	const toggleLetter = (letter: string) => {
		setSelectedLetters((prev) => (prev.includes(letter) ? prev.filter((l) => l !== letter) : [...prev, letter]));
	};

	useEffect(() => {
		onChange?.(selectedLetters);
	}, [selectedLetters]);

	const visibleLetters = showAll ? letterOptions : letterOptions.slice(0, 4);
	const hasMore = letterOptions.length > 4;

	// Split into rows of 4
	const rows: (typeof letterOptions)[] = [];
	for (let i = 0; i < visibleLetters.length; i += 4) {
		rows.push(visibleLetters.slice(i, i + 4));
	}

	return (
		<VStack space="md">
			{rows.map((row, rowIndex) => (
				<HStack key={rowIndex} space="xl" className="w-full justify-between">
					{row.map((letter) => (
						<HStack key={letter} space="md" className="flex-1 items-center">
							<Text className="text-2xl font-bold min-w-[30px]">{letter}</Text>
							<Checkbox
								value={letter}
								isChecked={selectedLetters.includes(letter)}
								onChange={() => toggleLetter(letter)}
								size="lg"
							>
								<CheckboxIndicator>
									<CheckboxIcon as={CheckIcon} />
								</CheckboxIndicator>
							</Checkbox>
						</HStack>
					))}
					{row.length < 4 &&
						Array.from({ length: 4 - row.length }).map((_, i) => <View key={`placeholder-${i}`} className="flex-1" />)}
				</HStack>
			))}

			{hasMore && (
				<Button variant="link" onPress={() => setShowAll(!showAll)} className="self-start">
					<ButtonText className="text-primary-500">
						{showAll ? i18n.t("general.showLess") : i18n.t("general.viewMore")}
					</ButtonText>
				</Button>
			)}
		</VStack>
	);
}

export default Letters;
