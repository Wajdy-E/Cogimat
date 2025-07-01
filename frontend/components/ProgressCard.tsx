import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Progress, ProgressFilledTrack } from '@/components/ui/progress';
import { VStack } from '@/components/ui/vstack';
import { i18n } from '../i18n';

interface ProgressCardProps {
	value: number; // percentage for progress bar
	rawCount: number; // actual count for subtext
	goalTarget: number; // goal target for subtext
	headingKey: string;
	subTextKey: string;
	descriptionKey: string;
}

export default function ProgressCard (props: ProgressCardProps) {
	return (
		<VStack space="lg" className="w-full bg-background-500 rounded-md p-3">
			<Heading>{i18n.t(props.headingKey)}</Heading>
			<Text>{i18n.t(props.descriptionKey)}</Text>
			<Progress value={props.value} className="w-full h-2 bg-secondary-800">
				<ProgressFilledTrack className="h-2 bg-primary-500" />
			</Progress>
			<Text size="sm">{i18n.t(props.subTextKey, { count: props.rawCount, target: props.goalTarget })}</Text>
		</VStack>
	);
}
