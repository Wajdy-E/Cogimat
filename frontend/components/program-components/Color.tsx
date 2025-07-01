import { ColorOption } from '../../data/program/Program';
import { Button, ButtonIcon } from '../../app/components/ui/button';
import { CheckIcon } from '@/components/ui/icon';

type ColorProps = ColorOption & {
	selected: boolean;
	onPress: () => void;
};

function Color ({ hexcode, selected, onPress }: ColorProps) {
	return (
		<Button
			onPress={onPress}
			className="h-10 w-10 rounded-full flex items-center justify-center"
			style={{ backgroundColor: hexcode }}
		>
			{selected && <ButtonIcon as={CheckIcon} />}
		</Button>
	);
}

export default Color;
