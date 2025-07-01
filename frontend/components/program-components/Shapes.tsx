import { HStack } from '@/components/ui/hstack';
import { shapeOptions } from '../../data/program/Program';
import { Button, ButtonIcon } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface ShapesProps {
	onChange?: (selected: string[]) => void;
}
function Shapes (props: ShapesProps) {
	const [selectedShapes, setSelectedShapes] = useState<string[]>([]);

	const toggleShape = (name: string) => {
		setSelectedShapes((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
	};

	useEffect(() => {
		props.onChange?.(selectedShapes);
	}, [selectedShapes]);

	return (
		shapeOptions.length > 0 && (
			<HStack space="4xl">
				{shapeOptions.map((shape) => (
					<Button
						key={shape.name}
						onPress={() => toggleShape(shape.name)}
						className="flex items-center justify-center p-0"
						variant="link"
					>
						<ButtonIcon
							as={shape.icon}
							className={`h-10 w-10 ${
								selectedShapes.includes(shape.name)
									? 'fill-primary-500 stroke-primary-500'
									: 'fill-secondary-0 stroke-secondary-0'
							}`}
						/>
					</Button>
				))}
			</HStack>
		)
	);
}

export default Shapes;
