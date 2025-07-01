import { useState } from 'react';
import { ShapeOption } from '../../data/program/Program';
import { Button, ButtonIcon } from '../../app/components/ui/button';

function Shape (props: ShapeOption) {
	const [selected, setSelected] = useState(false);
	const Icon = props.icon; // Assign icon component

	return (
		<Button onPress={() => setSelected(!selected)} className="flex items-center justify-center p-0" variant="link">
			{/* <Icon size={50} color="white" className={`${selected ? "bg-black" : "bg-gray-400"}`}> */}
			<ButtonIcon
				as={Icon}
				className={`${selected ? 'fill-white stroke-white' : 'fill-primary-500 stroke-primary-500'} h-10 w-10`}
				style={{}}
			/>
		</Button>
	);
}

export default Shape;
