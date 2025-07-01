import { Tabs } from 'expo-router';
import { useSelector } from 'react-redux';
import { Theme } from '../../store/auth/authSlice';
import { RootState } from '../../store/store';
import BackButton from '../../components/BackButton';

function Layout () {
	const theme = useSelector((state: RootState) => state.user.user.settings?.theme);
	const themeColor = theme === Theme.Dark ? '#000000' : 'ffffff';
	const themeTextColor = theme === Theme.Dark ? '#ffffff' : '#000000';

	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				headerStyle: { backgroundColor: themeColor, borderBottomColor: themeTextColor, borderBottomWidth: 1 },
				headerTintColor: themeTextColor,
				tabBarStyle: { display: 'none' },
				headerLeft: () => <BackButton />,
			}}
		/>
	);
}

export default Layout;
