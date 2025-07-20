import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import {
	setCurrentUser,
	setMilestonesProgress,
	setSubscriptionStatus,
	UserBase,
	UserMilestones,
	UserSubscriptionState,
	setAuthError,
	setUserAlreadyExists,
	setIsLoggingIn,
	setIsSigningUp,
	setShowQrPrompt,
	setPendingVerification,
	resetAuthState,
	setIsSignedIn,
	setCancelledQRSignup,
	setVerificationCodeError,
} from "./authSlice";
import { RootState } from "@/store";
import { fetchExercises, getCustomExercises, getPublicExercises, fetchGoals } from "../data/dataSaga";

const BASE_URL = process.env.BASE_URL;
console.log("BASE_URL", BASE_URL);

// Extended interface for user creation with optional QR code
interface CreateUserData extends UserBase {
	qrCode?: string;
}

export const createUser = createAsyncThunk<UserBase, CreateUserData>(
	"auth/createUser",
	async (userData: CreateUserData, { dispatch, rejectWithValue }) => {
		try {
			const response = await axios.post(`${BASE_URL}/api/auth/signup`, userData);
			dispatch(setCurrentUser(userData as UserBase));
			return response.data;
		} catch (error: any) {
			console.error("Error creating user:", error);
			const errorMsg =
				error.response && error.response.data && error.response.data.message
					? error.response.data.message
					: "Failed to create user. Please try again later.";

			// Handle user already exists case
			if (errorMsg === "signup.userExists.message") {
				dispatch(setUserAlreadyExists(true));
			}

			return rejectWithValue(errorMsg);
		}
	}
);

export const setCurrentUserThunk = createAsyncThunk<UserBase, UserBase>(
	"auth/setCurrentUser",
	async (userData: UserBase, { dispatch }) => {
		try {
			console.log(userData);
			dispatch(setCurrentUser(userData));
			return userData;
		} catch (error) {
			console.error("Error in setCurrentUser:", error);
			throw error;
		}
	}
);

export const checkIfUserExistsAndHasQrAccess = createAsyncThunk(
	"auth/checkIfUserExistsAndHasQrAccess",
	async (clerk_id: string, { rejectWithValue }) => {
		try {
			const response = await axios.get(`${BASE_URL}/api/auth/check-if-user-exists`, { params: { clerk_id } });
			const data = response.data;

			return {
				exists: data.exists,
				hasQrAccess: data.hasQrAccess,
				user: data.user || null,
			};
		} catch (error: any) {
			console.error("Error checking if user exists:", error);
			const errorMsg =
				error.response && error.response.data && error.response.data.message
					? error.response.data.message
					: "Failed to check if user exists. Please try again later.";
			return rejectWithValue(errorMsg);
		}
	}
);

export const deleteUserThunk = createAsyncThunk("auth/deleteUser", async (clerk_id: string, { dispatch }) => {
	try {
		const response = await axios.delete(`${BASE_URL}/api/auth/delete-user`, { data: { userId: clerk_id } });
		return {
			status: response.status,
			message: response.data?.message,
		};
	} catch (error) {
		console.error("Error deleting user:", error);
		throw error;
	}
});

export const fetchUserMilestones = createAsyncThunk(
	"milestones/fetchUserMilestones",
	async (_, { getState, dispatch }) => {
		try {
			const state = getState() as RootState;
			const userId = state.user?.user?.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}
			const response = await axios.get(`${BASE_URL}/api/user-milestones`, { params: { userId } });

			// The response is an array, get the first element
			const milestoneData = response.data[0] || {};

			const milestones: UserMilestones = {
				exercisesCompleted: milestoneData.exercisescompleted || 0,
				beginnerExercisesCompleted: milestoneData.beginnerexercisescompleted || 0,
				intermediateExercisesCompleted: milestoneData.intermediateexercisescompleted || 0,
				advancedExercisesCompleted: milestoneData.advancedexercisescompleted || 0,
				communityExercisesCompleted: milestoneData.communityexercisescompleted || 0,
				customExercisesCompleted: milestoneData.customexercisescompleted || 0,
				customExercisesCreated: milestoneData.customexercisescreated || 0,
				goalsCreated: milestoneData.goalscreated || 0,
				educationalArticlesCompleted: milestoneData.educationalarticlescompleted || 0,
			};
			dispatch(setMilestonesProgress(milestones));
		} catch (error) {
			console.error("Error fetching milestones progress:", error);
			throw error;
		}
	}
);

export const updateUserMilestone = createAsyncThunk(
	"milestones/updateUserMilestone",
	async (
		{ milestoneType, exerciseDifficulty }: { milestoneType: string; exerciseDifficulty?: string },
		{ getState, dispatch }
	) => {
		try {
			const state = getState() as RootState;
			const userId = state.user?.user?.baseInfo?.id;
			if (!userId) {
				throw new Error("User is not authenticated");
			}

			await axios.patch(`${BASE_URL}/api/user-milestones`, {
				userId,
				milestoneType,
				exerciseDifficulty,
			});

			// Refresh milestones after update
			dispatch(fetchUserMilestones());
		} catch (error) {
			console.error("Error updating milestone:", error);
			throw error;
		}
	}
);

export const updateSubscriptionStatus = createAsyncThunk<void, UserSubscriptionState>(
	"auth/updateSubscriptionStatus",
	async (subscriptionData: UserSubscriptionState, { dispatch, getState }) => {
		try {
			const state = getState() as RootState;
			const userId = state.user?.user?.baseInfo?.id;

			if (!userId) {
				throw new Error("User is not authenticated");
			}

			await axios.post(`${BASE_URL}/api/auth/update-subscription`, {
				userId,
				isSubscribed: subscriptionData.isSubscribed,
			});

			dispatch(setSubscriptionStatus(subscriptionData));
		} catch (error) {
			console.error("Error updating subscription status:", error);
			throw error;
		}
	}
);

export const fetchUserData = createAsyncThunk<{ data: { user: UserBase; message: string }; status: number }, string>(
	"auth/fetchUserData",
	async (clerk_id: string, { rejectWithValue }) => {
		try {
			const response = await axios.get(`${BASE_URL}/api/auth/login`, { params: { clerk_id } });
			return {
				data: response.data,
				status: response.status,
			};
		} catch (error: any) {
			// If user not found in database, they might be a new user who needs QR validation
			if (error.response && error.response.status === 400 && error.response.data?.message === "User not found") {
				console.log("in 400");
				return rejectWithValue("User not found in database");
			}

			console.error("Error fetching user data:", error);
			const errorMsg =
				error.response && error.response.data && error.response.data.message
					? error.response.data.message
					: "Failed to fetch user data. Please try again later.";
			return rejectWithValue(errorMsg);
		}
	}
);

// New authentication thunks
export const handleEmailSignup = createAsyncThunk<
	{ success: boolean; message?: string },
	{ email: string; password: string; firstName: string; lastName: string; signUp: any; signOut: any }
>(
	"auth/handleEmailSignup",
	async ({ email, password, firstName, lastName, signUp, signOut }, { dispatch, rejectWithValue }) => {
		try {
			dispatch(setIsSigningUp(true));
			dispatch(setAuthError(null));

			await signUp.create({ emailAddress: email, password, firstName, lastName });
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

			dispatch(setPendingVerification(true));
			return { success: true };
		} catch (error: any) {
			console.error("Email signup error:", error);
			dispatch(setAuthError(error.message || "Signup failed"));
			await signOut();
			return rejectWithValue(error.message || "Signup failed");
		}
	}
);

export const handleEmailLogin = createAsyncThunk<
	{ success: boolean; message?: string },
	{ email: string; password: string; signIn: any; setActive: any }
>("auth/handleEmailLogin", async ({ email, password, signIn, setActive }, { dispatch, rejectWithValue }) => {
	try {
		dispatch(setIsLoggingIn(true));
		dispatch(setAuthError(null));

		const signInAttempt = await signIn.create({
			identifier: email,
			password,
		});

		if (signInAttempt.status === "complete") {
			await setActive({ session: signInAttempt.createdSessionId });
			return { success: true };
		} else {
			throw new Error("Login incomplete");
		}
	} catch (error: any) {
		console.error("Email login error:", error);
		dispatch(setAuthError(error.message || "Login failed"));
		return rejectWithValue(error.message || "Login failed");
	} finally {
		dispatch(setIsLoggingIn(false));
	}
});

export const handleProviderLogin = createAsyncThunk<
	{ success: boolean; message?: string },
	{ strategy: string; startSSOFlow: any }
>("auth/handleProviderLogin", async ({ strategy, startSSOFlow }, { dispatch, rejectWithValue }) => {
	try {
		dispatch(setIsLoggingIn(true));
		dispatch(setAuthError(null));

		const { createdSessionId, setActive } = await startSSOFlow({
			strategy: `oauth_${strategy}`,
			redirectUrl: "cogimat://oauth-callback",
		});

		if (createdSessionId) {
			await setActive?.({ session: createdSessionId });
			return { success: true };
		} else {
			throw new Error("Provider login incomplete");
		}
	} catch (error: any) {
		console.error("Provider login error:", error);
		dispatch(setAuthError(error.message || "Provider login failed"));
		return rejectWithValue(error.message || "Provider login failed");
	} finally {
		dispatch(setIsLoggingIn(false));
	}
});

export const handleEmailVerification = createAsyncThunk<
	{ success: boolean; message?: string; sessionId?: string },
	{ code: string; signUp: any; setActive: any }
>("auth/handleEmailVerification", async ({ code, signUp, setActive }, { dispatch, rejectWithValue }) => {
	console.log("handleEmailVerification saga called");
	try {
		dispatch(setAuthError(null));

		const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });

		if (signUpAttempt.status === "complete") {
			console.log("Email verification complete, storing session for later activation");
			// Store the session ID but don't activate it yet
			// We'll activate it after QR signup is complete
			dispatch(setPendingVerification(false));
			dispatch(setShowQrPrompt(true));
			console.log("Email verification saga completed successfully");
			return { success: true, sessionId: signUpAttempt.createdSessionId };
		} else {
			throw new Error("Verification incomplete");
		}
	} catch (error: any) {
		console.error("Email verification error:", error);
		dispatch(setVerificationCodeError(error.message || "Verification failed"));
		return rejectWithValue(error.message || "Verification failed");
	}
});

export const handleQRCodeSignup = createAsyncThunk<
	{ success: boolean; message?: string },
	{ userData: any; qrCode: string; sessionId: string; setActive: any }
>("auth/handleQRCodeSignup", async ({ userData, qrCode, sessionId, setActive }, { dispatch, rejectWithValue }) => {
	try {
		dispatch(setAuthError(null));
		console.log(userData, "userData");
		const { firstName, lastName, emailAddresses, id, username } = userData;
		const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0]?.emailAddress;

		// Create user in database with QR validation
		const createdUser = await dispatch(
			createUser({
				firstName,
				lastName,
				email: emailAddress,
				id,
				username,
				qrCode,
			})
		).unwrap();

		// Set the current user in Redux
		dispatch(
			setCurrentUserThunk({
				firstName,
				lastName,
				email: emailAddress,
				id,
				username,
				profileUri: userData.imageUrl,
				isAdmin: createdUser.isAdmin || false,
				hasQrAccess: true,
			})
		);

		// Now that the complete signup process is done, activate the session
		console.log("Complete signup process finished, activating session");
		// await setActive({ session: sessionId });

		return { success: true, message: "QR code signup successful" };
	} catch (error: any) {
		console.error("QR Code Signup Error:", error);
		dispatch(setAuthError(error.message || "QR code signup failed"));
		return rejectWithValue(error.message || "QR code signup failed");
	} finally {
		dispatch(setIsSigningUp(false));
		dispatch(setIsSignedIn(true));
	}
});

export const handleUserAuthentication = createAsyncThunk<
	{ success: boolean; redirect?: string },
	{ user: any; isSignedIn: boolean; signOut: any }
>("auth/handleUserAuthentication", async ({ user, isSignedIn, signOut }, { dispatch, rejectWithValue }) => {
	console.log("handleUserAuthentication saga called - user:", !!user, "isSignedIn:", isSignedIn);
	try {
		if (!user || !isSignedIn) {
			console.log("handleUserAuthentication: No user or not signed in");
			return { success: false, redirect: "/(auth)" };
		}

		const { firstName, lastName, emailAddresses, id, username } = user;
		const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0]?.emailAddress;

		// Check if user exists in database
		console.log("handleUserAuthentication: Checking if user exists in database");
		const result = await dispatch(fetchUserData(id)).unwrap();
		const { data, status } = result;

		if (status === 400) {
			// User doesn't exist in database, show QR prompt
			console.log("handleUserAuthentication: User not found, showing QR prompt");
			dispatch(setShowQrPrompt(true));
			dispatch(
				setCurrentUserThunk({
					firstName,
					lastName,
					email: emailAddress,
					id,
					username,
					profileUri: user.imageUrl,
					isAdmin: false,
				})
			);
			return { success: true, redirect: "signup" };
		} else if (status === 200) {
			// User exists, set user data and redirect to home
			console.log("handleUserAuthentication: User found, setting user data");
			dispatch(
				setCurrentUserThunk({
					firstName,
					lastName,
					email: emailAddress,
					id,
					username,
					profileUri: user.imageUrl,
					isAdmin: data.user.isAdmin || false,
					hasQrAccess: data.user.hasQrAccess,
				})
			);

			// Note: Data fetching will be handled by the calling component

			dispatch(setIsSignedIn(true));
			console.log("handleUserAuthentication: Setting isSignedIn to true, redirecting to home");
			return { success: true, redirect: "/(tabs)/home" };
		}

		return { success: false };
	} catch (error: any) {
		console.error("User authentication error:", error);
		await signOut();
		console.log("in error");
		dispatch(setAuthError(error.message || "Authentication failed"));
		return rejectWithValue(error.message || "Authentication failed");
	}
});

export const handleSignOut = createAsyncThunk<
	{ success: boolean },
	{ signOut: any; deleteUser?: boolean; userId?: string }
>("auth/handleSignOut", async ({ signOut, deleteUser, userId }, { dispatch }) => {
	try {
		if (deleteUser && userId) {
			await dispatch(deleteUserThunk(userId));
		}

		await signOut();
		dispatch(resetAuthState());
		dispatch(setIsSignedIn(false));
		dispatch(setCancelledQRSignup(true));

		return { success: true };
	} catch (error: any) {
		console.error("Sign out error:", error);
		return { success: false };
	}
});
