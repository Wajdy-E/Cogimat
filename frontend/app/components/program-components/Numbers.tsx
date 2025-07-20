import { HStack } from '@/components/ui/hstack';
import { numOptions } from '../../data/program/Program';
import { Button, ButtonText } from '@/components/ui/button';
import { useState, useEffect } from 'react';

type NumbersProps = {
	onChange?: (selected: number[]) => void;
};

function Numbers ({ onChange }: NumbersProps) {
	const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

	const toggleNumber = (num: number) => {
		setSelectedNumbers((prev) => (prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]));
	};

	useEffect(() => {
		onChange?.(selectedNumbers);
	}, [selectedNumbers]);

	return (
		<HStack space="4xl">
			{numOptions.map((num) => (
				<Button
					key={num.numAsString}
					onPress={() => toggleNumber(Number(num.num))}
					className="flex items-center justify-center p-0"
					variant="link"
				>
					<ButtonText
						className={`h-10 w-10 text-center text-4xl ${
							selectedNumbers.includes(Number(num.num)) ? 'text-primary-500' : 'text-typography-950'
						}`}
					>
						{num.numAsString}
					</ButtonText>
				</Button>
			))}
		</HStack>
	);
}

export default Numbers;
