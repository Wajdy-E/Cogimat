import { HStack } from "@/components/ui/hstack";
import { colorOptions } from "../../data/program/Program";
import Color from "./Color";

function Colors() {
	return (
		colorOptions.length > 0 && (
			<>
				<HStack space="4xl">
					{colorOptions.map((color) => (
						<Color hexcode={color.hexcode} name={color.name} key={color.name} />
					))}
				</HStack>
			</>
		)
	);
}

export default Colors;
