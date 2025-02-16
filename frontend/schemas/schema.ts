import * as Yup from "yup";

export const signupSchema = Yup.object().shape({
	firstName: Yup.string()
		.required("First name is required")
		.min(2, "First name must be at least 2 characters"),
	lastName: Yup.string()
		.required("Last name is required")
		.min(2, "Last name must be at least 2 characters"),
	email: Yup.string()
		.required("Email is required")
		.email("Invalid email address"),
	password: Yup.string()
		.required("Password is required")
		.min(6, "Password must be at least 6 characters"),
});
