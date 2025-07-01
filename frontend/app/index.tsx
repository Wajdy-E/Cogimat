import '../global.css';
import { ImageBackground, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useEffect, useRef } from 'react';
import { fetchExercises, fetchGoals, getCustomExercises, getPublicExercises } from '../store/data/dataSaga';
import { AppDispatch } from '../store/store';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { fetchUserMilestones, setCurrentUserThunk, fetchUserData } from '../store/auth/authSaga';

export default function Home () {
	const backgroundImage = require('../assets/index.png');
	const logo = require('../assets/cogimatlogo.png');
	const router = useRouter();
	const { isSignedIn, signOut } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();
	const isProcessingRef = useRef(false);

	// console.log("isSignedIn", isSignedIn);
	useEffect(() => {
		async function handleAuthState () {
			// Prevent multiple simultaneous executions
			if (isProcessingRef.current) {
				return;
			}
			isProcessingRef.current = true;

			try {
				if (isSignedIn && user) {
					const { emailAddresses } = user;
					const emailAddress = typeof emailAddresses === 'string' ? emailAddresses : emailAddresses[0].emailAddress;

					// Fetch user data from backend to check QR access status and get isAdmin
					const userDataResult = await dispatch(fetchUserData(emailAddress)).unwrap();

					if (userDataResult === null) {
						// User not found in database, needs QR validation
						router.push('/(auth)/signup');
					} else if (userDataResult && typeof userDataResult === 'object' && 'hasQrAccess' in userDataResult) {
						const hasQrAccess = userDataResult.hasQrAccess;
						const isAdmin = userDataResult.isAdmin || false;

						// Update user with backend data including isAdmin (only once)
						await dispatch(
							setCurrentUserThunk({
								firstName: user.firstName,
								lastName: user.lastName,
								email: emailAddress,
								id: user.id,
								username: user.username,
								profileUri: user.imageUrl,
								isAdmin: isAdmin,
								hasQrAccess: hasQrAccess,
							}),
						).unwrap();

						if (hasQrAccess) {
							await Promise.all([
								dispatch(fetchExercises()).unwrap(),
								dispatch(getCustomExercises()).unwrap(),
								dispatch(getPublicExercises()).unwrap(),
								dispatch(fetchUserMilestones()).unwrap(),
								dispatch(fetchGoals()).unwrap(),
							]);

							router.push('/(tabs)/');
						} else {
							// User doesn't have QR access, route to signup for QR validation
							router.push('/(auth)/signup');
						}
					} else {
						// Invalid user data, route to signup for QR validation
						router.push('/(auth)/signup');
					}
				} else {
					setTimeout(() => {
						router.push('/AppLoaded');
					}, 3000);
				}
			} catch (error) {
				console.error('Error fetching initial data:', error);
				// If there's an error, we should probably sign out the user
				// since their session might be invalid
				await signOut();
				router.push('/AppLoaded');
			} finally {
				isProcessingRef.current = false;
			}
		}

		handleAuthState();
	}, [isSignedIn, user?.id]); // Only depend on isSignedIn and user.id to prevent unnecessary re-runs

	return (
		<View className="flex-1 bg-black">
			<ImageBackground source={backgroundImage} resizeMode="cover" className="h-screen">
				<View className="h-full bg-black/50 justify-center items-center">
					<Image source={logo} resizeMode="contain" className="aspect-square max-w-[250px]" />
				</View>
			</ImageBackground>
		</View>
	);
}
