import { View, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Heading } from '@/components/ui/heading';
import { CustomExercise } from '../store/data/dataSlice';
import { Button, ButtonIcon } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { useTheme } from '@/components/ui/ThemeProvider';
import { setCommunityExerciseFavourite } from '../store/data/dataSaga';
import { i18n } from '../i18n';

export default function CommunityExerciseHeader () {
	const { id } = useLocalSearchParams();
	const dispatch: AppDispatch = useDispatch();
	const router = useRouter();
	const { themeTextColor } = useTheme();

	// Get the current exercise from Redux state
	const exercises = useSelector((state: RootState) => state.data.selectedExercise) as CustomExercise | null;

	// Show loading state if exercise is not found
	if (!exercises) {
		return (
			<SafeAreaView className="bg-background-800">
				<View className="flex-row items-center w-full justify-center py-3">
					<View className="flex-row items-center justify-between gap-3 w-[90%]">
						<View className="flex-row items-center gap-3">
							<Button variant="link" onPress={() => router.push('/(tabs)')}>
								<ButtonIcon as={ArrowLeft} size={'xxl' as any} stroke={themeTextColor} />
							</Button>
							<Heading className="text-typography-950" size="2xl" numberOfLines={1} style={{ maxWidth: '79%' }}>
								{i18n.t('general.loading')}
							</Heading>
						</View>
					</View>
				</View>
			</SafeAreaView>
		);
	}

	function onFavourite () {
		try {
			if (!exercises) {
				return;
			}

			dispatch(
				setCommunityExerciseFavourite({
					exerciseId: exercises.id,
					isFavourited: !exercises.isFavourited,
				}),
			);
		} catch (error) {
			console.error('Error in onFavourite:', error);
		}
	}

	return (
		<SafeAreaView className="bg-background-800">
			<View className="flex-row items-center w-full justify-center py-3">
				<View className="flex-row items-center justify-between gap-3 w-[90%]">
					<View className="flex-row items-center gap-3">
						<Button variant="link" onPress={() => router.push('/(tabs)')}>
							<ButtonIcon as={ArrowLeft} size={'xxl' as any} stroke={themeTextColor} />
						</Button>
						<Heading className="text-typography-950" size="2xl" numberOfLines={1} style={{ maxWidth: '79%' }}>
							{exercises.name}
						</Heading>
					</View>
					<View className="flex-row items-center gap-2">
						<Button variant="link" onPress={onFavourite}>
							<ButtonIcon
								as={Star}
								stroke={`${exercises.isFavourited ? 'yellow' : 'white'}`}
								fill={`${exercises.isFavourited ? 'yellow' : 'white'}`}
								size={'xxl' as any}
								className={`${exercises.isFavourited ? 'fill-yellow-300' : ''}`}
							/>
						</Button>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}
