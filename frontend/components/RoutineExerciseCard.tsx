import { Image } from '@/components/ui/image';
import { View } from 'react-native';
import { Exercise, ExerciseDifficulty, CustomExercise } from '../store/data/dataSlice';
import { Card } from '@/components/ui/card';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Clock, Sprout, Rocket, Trophy, X } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';
import { Button, ButtonIcon } from '@/components/ui/button';
import { i18n } from '../i18n';

interface RoutineExerciseCardProps {
	exercise: Exercise | CustomExercise;
	exerciseType: 'standard' | 'custom';
	onRemove?: () => void;
	classes?: string;
}

const placeHolder = require('../assets/exercise-thumbnails/placeholder.png');

function RoutineExerciseCard (props: RoutineExerciseCardProps) {
	const exerciseImage = props.exercise.imageFileUrl ? { uri: props.exercise.imageFileUrl } : placeHolder;

	function getIconForType () {
		return (
			<Icon
				size="md"
				as={
					props.exercise.difficulty === ExerciseDifficulty.Beginner
						? Sprout
						: props.exercise.difficulty === ExerciseDifficulty.Intermediate
							? Rocket
							: Trophy
				}
			/>
		);
	}

	function getTimeDisplay () {
		if ('timeToComplete' in props.exercise) {
			// Standard exercise
			const totalSeconds = parseInt(props.exercise.timeToComplete, 10);
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			return `${minutes}${i18n.t('exercise.card.minutes')}${seconds > 0 ? ` ${seconds}${i18n.t('exercise.card.seconds')}` : ''}`;
		} else {
			// Custom exercise
			const totalMinutes = parseFloat(props.exercise.customizableOptions?.exerciseTime.toString() || '60');
			const minutes = Math.floor(totalMinutes);
			const seconds = Math.round((totalMinutes - minutes) * 60);
			return `${minutes}${i18n.t('exercise.card.minutes')}${seconds > 0 ? ` ${seconds}${i18n.t('exercise.card.seconds')}` : ''}`;
		}
	}

	return (
		<Card variant="outline" className={`p-0 rounded-md overflow-hidden ${props.classes}`}>
			<VStack space="sm" className="content relative">
				<View className="relative">
					<Image className="w-full h-24" source={exerciseImage} alt={props.exercise.name} resizeMode="cover" />
					{props.onRemove && (
						<Button
							size="sm"
							variant="solid"
							action="negative"
							className="absolute top-1 right-1 w-6 h-6 rounded-full"
							onPress={props.onRemove}
						>
							<ButtonIcon as={X} size="xs" />
						</Button>
					)}
				</View>
				<View className="p-2">
					<Heading size="sm" numberOfLines={1} style={{ maxWidth: '90%' }}>
						{props.exercise.name}
					</Heading>
					<View className="flex-row gap-2">
						<View className="flex-row items-center gap-1">
							<Icon size="sm" as={Clock} />
							<Text size="sm">{getTimeDisplay()}</Text>
						</View>
						<View className="flex-row items-center gap-1" style={{ maxWidth: '100%' }}>
							{getIconForType()}
							<Text size="sm" ellipsizeMode="tail" numberOfLines={1}>
								{i18n.t(`exercise.difficulty.${props.exercise.difficulty.toLowerCase()}`)}
							</Text>
						</View>
					</View>
				</View>
			</VStack>
		</Card>
	);
}

export default RoutineExerciseCard;
