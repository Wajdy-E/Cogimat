import { useState } from "react";
import { ColorOption } from "../../data/program/Program";
import { Button, ButtonIcon } from "../../app/components/ui/button";
import { CheckIcon } from "@/components/ui/icon";
function Color(props: ColorOption) {
	const [selected, setSelected] = useState(false);

	return (
		<Button
			onPress={() => setSelected(!selected)}
			className="h-10 w-10 rounded-full flex items-center justify-center"
			style={{ backgroundColor: props.hexcode }}
		>
			<ButtonIcon as={selected ? CheckIcon : undefined} />
		</Button>
	);
}

export default Color;
