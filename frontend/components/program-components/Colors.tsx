import { useEffect, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import { colorOptions } from "../../data/program/Program";
import Color from "./Color";

type ColorsProps = {
	onChange?: (selectedColors: string[]) => void; // Array of selected color names (or hex)
};

function Colors({ onChange }: ColorsProps) {
	const [selectedColors, setSelectedColors] = useState<string[]>([]);

	const toggleColor = (name: string) => {
		setSelectedColors((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));
	};

	useEffect(() => {
		onChange?.(selectedColors);
	}, [selectedColors]);

	return (
		colorOptions.length > 0 && (
			<HStack space="4xl">
				{colorOptions.map((color) => (
					<Color
						key={color.name}
						hexcode={color.hexcode}
						name={color.name}
						selected={selectedColors.includes(color.name)}
						onPress={() => toggleColor(color.name)}
					/>
				))}
			</HStack>
		)
	);
}

export default Colors;
