import { HStack } from "@/components/ui/hstack";
import { letterOptions } from "../../data/program/Program";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useState } from "react";

function Letters() {
	const [selected, setSelected] = useState(false);

	return (
		letterOptions.length > 0 && (
			<>
				<HStack space="4xl">
					{letterOptions.map((letter) => (
						<Button onPress={() => setSelected(!selected)} className="flex items-center justify-center p-0">
							<ButtonText className="h-10 w-10 text-center text-4xl">{letter}</ButtonText>
						</Button>
					))}
				</HStack>
			</>
		)
	);
}

export default Letters;
