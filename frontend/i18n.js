import { getLocales } from "expo-localization";
import { I18n } from "i18n-js";

const translations = {
	en: {
		pages: {
			home: "Home",
			progress: "Progress",
			createExercise: "Create Exercise",
			favourites: "Favourites",
			account: "Account",
		},
		home: {
			greeting: "Hi, {{name}}",
			subtitle: "It's time to challenge your limits.",
			tabs: {
				allExercises: "All Exercises",
				interactiveExercises: "Interactive Exercises",
				myCustomExercises: "My Custom Exercises",
				community: "Community",
			},
			exercisePrograms: {
				title: "Exercise programs",
				seeAll: "See All",
			},
			exerciseOfTheDay: "Exercise of the day",
			articleDateFormat: "MMMM D, YYYY",
		},
		account: {
			signout: "Sign out",
			deleteAccount: "Delete account",
		},
		signup: {
			title: "Sign Up",
			verifyEmailTitle: "Verify Your Email",
			verify: "Verify",
			verifyCode: "Verification Code",
			verifyCodePlaceholder: "Enter your verification code",
			orSignUpWith: "Or sign up with",
			googleSignUp: "Continue with Google",
			alreadyHaveAccount: "Already have an account?",
			login: "Log in",
			alert: {
				invalidData: "Invalid signup data",
				verificationFailed: "Verification failed",
			},
			form: {
				firstName: "First Name",
				firstNamePlaceholder: "Enter your first name",
				lastName: "Last Name",
				lastNamePlaceholder: "Enter your last name",
				email: "Email",
				emailPlaceholder: "Enter your email",
				password: "Password",
				passwordPlaceholder: "Enter your password",
				signUp: "Sign Up",
			},
			errors: {
				firstNameShort: "First name must be at least 2 characters",
				firstNameRequired: "First name is required",
				lastNameShort: "Last name must be at least 2 characters",
				lastNameRequired: "Last name is required",
				invalidEmail: "Invalid email address",
				emailRequired: "Email is required",
				passwordShort: "Password must be at least 6 characters",
				passwordRequired: "Password is required",
			},
		},
		login: {
			title: "Log In",
			email: "Email",
			emailPlaceholder: "Enter your email",
			password: "Password",
			passwordPlaceholder: "Enter your password",
			forgotPassword: "Forgot Password?",
			loginButton: "Login",
			orSignInWith: "Or Sign In With",
			googleSignIn: "Continue with Google",
			appleSignIn: "Continue with Apple",
			noAccount: "Don't have an account?",
			signUp: "Sign Up",
			alerts: {
				validationError: "Validation Error",
				invalidCredentials: "Login failed. Please check your credentials.",
			},
			errors: {
				invalidEmail: "Invalid email format",
				emailRequired: "Email is required",
				passwordShort: "Password must be at least 6 characters",
				passwordRequired: "Password is required",
			},
		},
	},
};
export const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? "en";

i18n.enableFallback = true;
i18n.locale = "ja";
