import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState, useCallback, useContext } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, persistor, RootState } from "@/store/store";
import { setCurrentUser, setIsSignedIn, setShowQrPrompt, resetAuthState } from "@/store/auth/authSlice";
import { fetchExercises, getCustomExercises, getPublicExercises, fetchGoals } from "@/store/data/dataSaga";
import { fetchUserMilestones, checkIfUserExistsAndHasQrAccess } from "@/store/auth/authSaga";

SplashScreen.preventAutoHideAsync();

type AuthState = {
	isLoggedIn: boolean;
	isReady: boolean;
	isLoading: boolean;
	logIn: () => void;
	logOut: () => void;
	refreshAuth: () => Promise<void>;
};

const authStorageKey = "auth-key";

export const AuthContext = createContext<AuthState>({
	isLoggedIn: false,
	isReady: false,
	isLoading: false,
	logIn: () => {},
	logOut: () => {},
	refreshAuth: async () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
	const [isReady, setIsReady] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { isSignedIn, isLoaded, signOut } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();

	// Get auth state from Redux
	const reduxAuthState = useSelector((state: RootState) => state.user);

	const storeAuthState = async (newState: { isLoggedIn: boolean }) => {
		try {
			const jsonValue = JSON.stringify(newState);
			await AsyncStorage.setItem(authStorageKey, jsonValue);
		} catch (error) {
			console.log("Error saving auth state", error);
		}
	};

	const fetchStartData = async () => {
		await Promise.all([
			dispatch(fetchExercises()).unwrap(),
			dispatch(getCustomExercises()).unwrap(),
			dispatch(getPublicExercises()).unwrap(),
			dispatch(fetchUserMilestones()).unwrap(),
			dispatch(fetchGoals()).unwrap(),
		]);
	};

	const fetchUserData = useCallback(async () => {
		if (!user || !isSignedIn) return false;

		try {
			const { emailAddresses } = user;
			const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0]?.emailAddress;

			// Check if user exists in database and has QR access
			const userDataResult = await dispatch(checkIfUserExistsAndHasQrAccess(user.id)).unwrap();

			if (!userDataResult.exists) {
				// User not found in database, needs QR validation
				dispatch(setShowQrPrompt(true));
				dispatch(
					setCurrentUser({
						firstName: user.firstName,
						lastName: user.lastName,
						email: emailAddress,
						id: user.id,
						username: user.username,
						profileUri: user.imageUrl,
						isAdmin: false,
					})
				);
				return false; // Not fully authenticated
			} else {
				const hasQrAccess = userDataResult.hasQrAccess;
				const isAdmin = userDataResult.user.isAdmin || false;

				// Update user with backend data
				dispatch(
					setCurrentUser({
						firstName: user.firstName,
						lastName: user.lastName,
						email: emailAddress,
						id: user.id,
						username: user.username,
						profileUri: user.imageUrl,
						isAdmin: isAdmin,
						hasQrAccess: hasQrAccess,
					})
				);

				if (hasQrAccess) {
					// Fetch all user data
					console.log("Fetching user data");
					await fetchStartData();
					return true; // Fully authenticated
				} else {
					// User exists but doesn't have QR access
					await signOut();
					return false;
				}
			}
		} catch (error) {
			console.error("Error fetching user data:", error);
			await signOut();
			return false;
		}
	}, [user, isSignedIn, signOut]);

	const logIn = useCallback(async () => {
		setIsLoading(true);
		try {
			const isFullyAuthenticated = await fetchUserData();
			if (isFullyAuthenticated) {
				dispatch(setIsSignedIn(true));
				await storeAuthState({ isLoggedIn: true });
			}
		} catch (error) {
			console.error("Login error:", error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchUserData]);

	const logOut = useCallback(async () => {
		setIsLoading(true);
		try {
			await signOut();
			dispatch(resetAuthState());
			dispatch(setIsSignedIn(false));
			persistor.purge();
			await storeAuthState({ isLoggedIn: false });
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			setIsLoading(false);
		}
	}, [signOut]);

	const refreshAuth = useCallback(async () => {
		setIsLoading(true);
		try {
			const isFullyAuthenticated = await fetchUserData();
			if (isFullyAuthenticated) {
				dispatch(setIsSignedIn(true));
				await storeAuthState({ isLoggedIn: true });
			}
		} catch (error) {
			console.error("Refresh auth error:", error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchUserData]);

	// Initialize auth state
	useEffect(() => {
		const initializeAuth = async () => {
			// Simulate a delay for better UX
			await new Promise((res) => setTimeout(() => res(null), 1000));

			try {
				// Check if user is signed in with Clerk
				if (isSignedIn && user && isLoaded) {
					const { emailAddresses } = user;
					const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0]?.emailAddress;

					// Check if user exists in database and has QR access
					const userDataResult = await dispatch(checkIfUserExistsAndHasQrAccess(user.id)).unwrap();

					if (!userDataResult.exists) {
						// User not found in database, needs QR validation
						dispatch(setShowQrPrompt(true));
						dispatch(
							setCurrentUser({
								firstName: user.firstName,
								lastName: user.lastName,
								email: emailAddress,
								id: user.id,
								username: user.username,
								profileUri: user.imageUrl,
								isAdmin: false,
							})
						);
					} else {
						const hasQrAccess = userDataResult.hasQrAccess;
						const isAdmin = userDataResult.user.isAdmin || false;

						// Update user with backend data
						dispatch(
							setCurrentUser({
								firstName: user.firstName,
								lastName: user.lastName,
								email: emailAddress,
								id: user.id,
								username: user.username,
								profileUri: user.imageUrl,
								isAdmin: isAdmin,
								hasQrAccess: hasQrAccess,
							})
						);

						if (hasQrAccess) {
							dispatch(setIsSignedIn(true));
							await storeAuthState({ isLoggedIn: true });
						} else {
							// User exists but doesn't have QR access
							await signOut();
						}
					}
				} else if (isLoaded) {
					// User is not signed in, check if we have stored auth state
					const value = await AsyncStorage.getItem(authStorageKey);
					if (value !== null) {
						const auth = JSON.parse(value);
						if (auth.isLoggedIn) {
							// User was previously logged in, but Clerk session is gone
							// Clear the stored state and redirect to auth
							await AsyncStorage.removeItem(authStorageKey);
						}
					}
				}
			} catch (error) {
				console.log("Error initializing auth", error);
			} finally {
				setIsReady(true);
			}
		};

		if (isLoaded) {
			initializeAuth();
		}
	}, [isSignedIn, user, isLoaded]);

	// Centralized routing based on auth state
	useEffect(() => {
		if (!isReady) return; // Don't route until auth is initialized

		if (reduxAuthState.isSignedIn) {
			// User is signed in, route to protected area
			router.replace("/home");
		} else {
			// User is not signed in, route to auth
			router.replace("/(auth)");
		}
	}, [reduxAuthState.isSignedIn, isReady]);

	// Hide splash screen when ready
	useEffect(() => {
		if (isReady) {
			SplashScreen.hideAsync();
		}
	}, [isReady]);

	// Fetch start data only when user is signed in
	useEffect(() => {
		if (isReady && reduxAuthState.isSignedIn) {
			fetchStartData();
		}
	}, [isReady, reduxAuthState.isSignedIn]);

	return (
		<AuthContext.Provider
			value={{
				isReady,
				isLoggedIn: reduxAuthState.isSignedIn,
				isLoading,
				logIn,
				logOut,
				refreshAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export const useAuthContext = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return context;
};
