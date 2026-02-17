import * as Yup from "yup";
import { i18n } from "@/i18n";

export const signupSchema = Yup.object().shape({
	firstName: Yup.string().required("yupErrors.form.firstNameRequired").min(2, "yupErrors.form.firstNameMin"),

	lastName: Yup.string().required("yupErrors.form.lastNameRequired").min(2, "yupErrors.form.lastNameMin"),

	email: Yup.string().required("yupErrors.form.emailRequired").email("yupErrors.form.emailInvalid"),

	password: Yup.string().required("yupErrors.form.passwordRequired").min(6, "yupErrors.form.passwordMin"),
});

export const createExerciseSchemaStep1 = Yup.object().shape({
	name: Yup.string()
		.required("yupErrors.form.nameRequired")
		.min(3, "yupErrors.form.nameMin")
		.max(50, "yupErrors.form.nameMax"),

	instructions: Yup.string()
		.required("yupErrors.form.instructionsRequired")
		.min(10, "yupErrors.form.instructionsMin")
		.max(1000, "yupErrors.form.instructionsMax"),

	focus: Yup.array().of(Yup.string().min(1, "yupErrors.form.focusMin")).max(5, "yupErrors.form.focusMax").optional(),

	difficulty: Yup.string()
		.oneOf(["Beginner", "Intermediate", "Advanced"], "yupErrors.form.difficultyInvalid")
		.required("yupErrors.form.difficultyRequired"),
});

export const createExerciseSchemaStep2 = Yup.object().shape({
	shapes: Yup.array().of(Yup.string()),
	letters: Yup.array().of(Yup.string()),
	numbers: Yup.array().of(Yup.number()),
	colors: Yup.array().of(Yup.string()),
	condition: Yup.mixed().test("at-least-one", "yupErrors.form.visualInputMissing", function () {
		const { shapes, letters, numbers, colors } = this.parent;
		return (
			(shapes && shapes.length > 0) ||
			(letters && letters.length > 0) ||
			(numbers && numbers.length > 0) ||
			(colors && colors.length > 0)
		);
	}),

	offScreenTime: Yup.number().min(0.5, "yupErrors.form.offScreenTime").required(),

	onScreenTime: Yup.number().min(0.5, "yupErrors.form.onScreenTime").required(),

	exerciseTime: Yup.number().min(0.5, "yupErrors.form.exerciseTime").required(),
});

export const signUpSchema = Yup.object().shape({
	firstName: Yup.string()
		.min(2, i18n.t("signup.errors.firstNameShort"))
		.required(i18n.t("signup.errors.firstNameRequired")),
	lastName: Yup.string()
		.min(2, i18n.t("signup.errors.lastNameShort"))
		.required(i18n.t("signup.errors.lastNameRequired")),
	email: Yup.string().email(i18n.t("signup.errors.invalidEmail")).required(i18n.t("signup.errors.emailRequired")),
	password: Yup.string()
		.min(6, i18n.t("signup.errors.passwordShort"))
		.required(i18n.t("signup.errors.passwordRequired")),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref("password")], i18n.t("signup.errors.passwordsDoNotMatch") || "Passwords do not match")
		.required(i18n.t("signup.errors.confirmPasswordRequired") || "Please confirm your password"),
});

export const loginSchema = Yup.object().shape({
	email: Yup.string().email(i18n.t("login.errors.invalidEmail")).required(i18n.t("login.errors.emailRequired")),
	password: Yup.string().min(6, i18n.t("login.errors.passwordShort")).required(i18n.t("login.errors.passwordRequired")),
});
