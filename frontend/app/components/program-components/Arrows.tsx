import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { arrowOptions } from "../../data/program/Program";
import { Button, ButtonIcon } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface ArrowsProps {
	onChange?: (selected: string[]) => void;
}

function Arrows(props: ArrowsProps) {
	const [selectedArrows, setSelectedArrows] = useState<string[]>([]);

	const toggleArrow = (name: string) => {
		setSelectedArrows((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
	};

	useEffect(() => {
		props.onChange?.(selectedArrows);
	}, [selectedArrows]);

	// Split arrows into cardinal (first 4) and diagonal (last 4) directions
	const cardinalArrows = arrowOptions.slice(0, 4);
	const diagonalArrows = arrowOptions.slice(4);

	return (
		arrowOptions.length > 0 && (
			<VStack space="md">
				<HStack space="4xl">
					{cardinalArrows.map((arrow) => (
						<Button
							key={arrow.name}
							onPress={() => toggleArrow(arrow.name)}
							className="flex items-center justify-center p-0"
							variant="link"
						>
							<ButtonIcon
								as={arrow.icon}
								className={`h-10 w-10 ${
									selectedArrows.includes(arrow.name) ? "stroke-primary-500" : "stroke-secondary-0"
								}`}
							/>
						</Button>
					))}
				</HStack>
				<HStack space="4xl">
					{diagonalArrows.map((arrow) => (
						<Button
							key={arrow.name}
							onPress={() => toggleArrow(arrow.name)}
							className="flex items-center justify-center p-0"
							variant="link"
						>
							<ButtonIcon
								as={arrow.icon}
								className={`h-10 w-10 ${
									selectedArrows.includes(arrow.name) ? "stroke-primary-500" : "stroke-secondary-0"
								}`}
							/>
						</Button>
					))}
				</HStack>
			</VStack>
		)
	);
}

export default Arrows;
