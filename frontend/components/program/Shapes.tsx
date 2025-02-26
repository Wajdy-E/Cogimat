import { HStack } from "@/components/ui/hstack";
import { shapeOptions } from "../../data/program/Program";
import Shape from "./Shape";

function Shapes() {
	return (
		shapeOptions.length > 0 && (
			<>
				<HStack space="4xl">
					{shapeOptions.map((shape) => (
						<Shape name={shape.name} key={shape.name} icon={shape.icon} />
					))}
				</HStack>
			</>
		)
	);
}

export default Shapes;
