import { StatusBar, View } from 'react-native';
import Colors from '../../components/program-components/Colors';
import { Heading } from '@/components/ui/heading';
import Shapes from '../../components/program-components/Shapes';
function CreateExercise () {
	return (
		<View>
			<View className="w-full flex items-center">
				<View className="flex-col w-[80%] gap-2">
					<Heading size="lg">Colors</Heading>
					<Colors />
				</View>
			</View>
			<Shapes />

			<StatusBar />
		</View>
	);
}

export default CreateExercise;
