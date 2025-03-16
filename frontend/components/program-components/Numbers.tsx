import { HStack } from "@/components/ui/hstack";
import { numOptions } from "../../data/program/Program";
import { Button, ButtonText } from "@/components/ui/button";
import { useState } from "react";

function Numbers() {
	const [selected, setSelected] = useState(false);

	return (
		<HStack space="4xl">
			{numOptions.map((num) => (
				<Button onPress={() => setSelected(!selected)} className="flex items-center justify-center p-0">
					<ButtonText className="h-10 w-10 text-center text-4xl" key={num.numAsString}>
						{num.num as unknown as string}
					</ButtonText>
				</Button>
			))}
		</HStack>
	);
}

export default Numbers;
