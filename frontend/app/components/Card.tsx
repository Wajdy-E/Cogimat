import { Button, Text, View } from 'react-native';
import { Box } from '@/components/ui/box';
import { i18n } from '../i18n';

interface CardBodyProps {
	title: string;
	btnKey: string;
	children: React.ReactNode;
}

function Card (props: CardBodyProps) {
	return (
		<View className="bg-white shadow-md rounded p-4">
			<Text className="text-lg font-semibold">{props.title}</Text>
			<Box>
				<Text>{i18n.t('card.greeting')}</Text>
			</Box>
			<Button title={props.btnKey} />
		</View>
	);
}

export default Card;
