import { useState } from "react";
import { Button, ButtonText } from "../../app/components/ui/button";

interface NumberProps {
	value: Number;
}

function Number({ value }: NumberProps) {
	const [selected, setSelected] = useState(false);

	return (
		<Button onPress={() => setSelected(!selected)} className="flex items-center justify-center p-0">
			<ButtonText className="h-10 w-10 text-center text-4xl">
				{value as unknown as string}
			</ButtonText>
		</Button>
	);
}

export default Number;
