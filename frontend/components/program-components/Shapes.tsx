import { HStack } from "@/components/ui/hstack";
import { shapeOptions } from "../../data/program/Program";
import { Button, ButtonIcon } from "@/components/ui/button";
import { useState } from "react";

function Shapes() {
	const [selected, setSelected] = useState(false);

	return (
		shapeOptions.length > 0 && (
			<>
				<HStack space="4xl">
					{shapeOptions.map((shape) => (
						<Button
							onPress={() => setSelected(!selected)}
							className="flex items-center justify-center p-0"
							variant="link"
						>
							<ButtonIcon
								as={shape.icon}
								className={`${selected ? "fill-white stroke-white" : "fill-primary-500 stroke-primary-500"} h-10 w-10`}
								style={{}}
							/>
						</Button>
					))}
				</HStack>
			</>
		)
	);
}

export default Shapes;
