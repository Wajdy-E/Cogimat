import { ArrowRightIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { GestureResponderEvent, Linking, View } from 'react-native';
import { Link } from '@/components/ui/link';
import { Heading } from '@/components/ui/heading';
import { Icon } from '@/components/ui/icon';
import { Divider } from '@/components/ui/divider';
import { ReactNode } from 'react';
import { i18n } from '../i18n';

export default function AccountLink (props: {
	title: string;
	link?: string;
	isExternal?: boolean;
	onPress?: (event?: GestureResponderEvent) => any;
	hideDivider?: boolean;
	children?: ReactNode;
}) {
	const handlePress = () => {
		if (props.onPress) {
			return props.onPress();
		}
		if (props.link) {
			if (props.isExternal) {
				Linking.openURL(props.link);
			} else {
				router.navigate(props.link);
			}
		}
	};

	return (
		<>
			{!props.hideDivider && <Divider className="bg-secondary-100" />}
			<View className="flex-row justify-between items-center">
				<Heading size="sm">{i18n.t(props.title)}</Heading>
				{props.children ?? (
					<Link onPress={handlePress}>
						<Icon as={ArrowRightIcon} />
					</Link>
				)}
			</View>
		</>
	);
}
