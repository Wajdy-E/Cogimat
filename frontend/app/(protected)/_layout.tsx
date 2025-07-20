import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { fetchUserMilestones } from "@/store/auth/authSaga";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchExercises, getCustomExercises, getPublicExercises, fetchGoals } from "@/store/data/dataSaga";
import { useEffect } from "react";

export default function ProtectedLayout() {
	const { isSignedIn, isLoaded } = useAuth();
	const dispatch: AppDispatch = useDispatch();

	if (!isSignedIn && isLoaded) {
		return <Redirect href="/" />;
	}

	async function fetchData() {
		try {
			await Promise.all([
				dispatch(fetchExercises()),
				dispatch(getCustomExercises()),
				dispatch(getPublicExercises()),
				dispatch(fetchUserMilestones()),
				dispatch(fetchGoals()),
			]);
		} catch (error: any) {
			console.error("Authentication error:", error);
		}
	}

	useEffect(() => {
		if (isSignedIn && isLoaded) {
			fetchData();
		}
	}, []);

	return <Stack />;
}
