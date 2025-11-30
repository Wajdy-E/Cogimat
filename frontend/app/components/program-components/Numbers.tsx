import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { numOptions } from "../../data/program/Program";
import { Button, ButtonText } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Checkbox, CheckboxIcon, CheckboxIndicator } from "@/components/ui/checkbox";
import { CheckIcon } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { i18n } from "../../i18n";

type NumbersProps = {
	onChange?: (selected: number[]) => void;
};

function Numbers({ onChange }: NumbersProps) {
	const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
	const [showAll, setShowAll] = useState(false);

	const toggleNumber = (num: number) => {
		setSelectedNumbers((prev) => (prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]));
	};

	useEffect(() => {
		onChange?.(selectedNumbers);
	}, [selectedNumbers]);

	const visibleNumbers = showAll ? numOptions : numOptions.slice(0, 4);
	const hasMore = numOptions.length > 4;

	// Split into rows of 4
	const rows: (typeof numOptions)[] = [];
	for (let i = 0; i < visibleNumbers.length; i += 4) {
		rows.push(visibleNumbers.slice(i, i + 4));
	}

	return (
		<VStack space="md">
			{rows.map((row, rowIndex) => (
				<HStack key={rowIndex} space="xl" className="w-full justify-between">
					{row.map((num) => (
						<HStack key={num.numAsString} space="md" className="flex-1 items-center">
							<Text className="text-2xl font-bold min-w-[30px]">{String(num.num)}</Text>
							<Checkbox
								value={num.num.toString()}
								isChecked={selectedNumbers.includes(Number(num.num))}
								onChange={() => toggleNumber(Number(num.num))}
								size="lg"
							>
								<CheckboxIndicator>
									<CheckboxIcon as={CheckIcon} />
								</CheckboxIndicator>
							</Checkbox>
						</HStack>
					))}
					{row.length < 4 &&
						Array.from({ length: 4 - row.length }).map((_, i) => (
							<View key={`placeholder-${i}`} className="flex-1" />
						))}
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

export default Numbers;
