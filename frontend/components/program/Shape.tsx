import { useState } from "react";
import { ShapeOption } from "../../data/program/Program";
import { Button, ButtonIcon } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icon";
function Shape(props: ShapeOption) {
	const [selected, setSelected] = useState(false);
	const Icon = props.icon; // Assign icon component

	return (
		<Button
			onPress={() => setSelected(!selected)}
			className="bg-transparent flex items-center justify-center"
		>
			<Icon
				size={50}
				color="white"
				className={`${selected ? "bg-black" : "bg-gray-400"}`}
			>
				<ButtonIcon as={selected ? CheckIcon : undefined} />
			</Icon>
		</Button>
	);
}

export default Shape;
