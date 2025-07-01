import { useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text } from 'react-native';
import { View } from 'react-native';

function Auth () {
	const { user } = useUser();
	return (
		<View className="bg-red-800">
			<Text>{user?.firstName}</Text>
			<Link href="/signup">signup </Link>
		</View>
	);
}

export default Auth;
