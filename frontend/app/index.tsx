import { Redirect } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { fetchUserData, fetchUserMilestones, setCurrentUserThunk } from "../store/auth/authSaga";
import { fetchExercises, getCustomExercises, getPublicExercises } from "../store/data/dataSaga";
import { fetchGoals } from "../store/data/dataSaga";

export default function Index() {
	const { isSignedIn } = useAuth();
	const { user } = useUser();
	const dispatch: AppDispatch = useDispatch();
	const baseInfo = useSelector((state: RootState) => state.user.user.baseInfo);
	if (user && baseInfo === null) {
		const { firstName, lastName, emailAddresses, id, username } = user;
		const emailAddress = typeof emailAddresses === "string" ? emailAddresses : emailAddresses[0].emailAddress;
		console.log("userData", emailAddress);
		// Then fetch user data from backend to check QR access status and get isAdmin
		dispatch(fetchUserData(id)).then(async (result) => {
			if (result.meta.requestStatus === "fulfilled") {
				const userData = result.payload as any;
				if (userData) {
					const hasQrAccess = userData.hasQrAccess;
					const isAdmin = userData.isAdmin || false;
					dispatch(
						setCurrentUserThunk({
							firstName,
							lastName,
							email: emailAddress,
							id,
							username,
							profileUri: user.imageUrl,
							isAdmin,
							hasQrAccess,
						})
					);

					await Promise.all([
						dispatch(fetchExercises()).unwrap(),
						dispatch(getCustomExercises()).unwrap(),
						dispatch(getPublicExercises()).unwrap(),
						dispatch(fetchUserMilestones()).unwrap(),
						dispatch(fetchGoals()).unwrap(),
					]);
				}
			}
		});
	}

	if (isSignedIn) {
		return <Redirect href="/(tabs)/home" />;
	} else {
		return <Redirect href="/(auth)" />;
	}
}
