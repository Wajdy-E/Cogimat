import { Triangle, Square, Diamond, Circle, LucideIcon } from "lucide-react-native";

export enum Color {
	GREEN = "GREEN",
	YELLOW = "YELLOW",
	RED = "RED",
	BLUE = "BLUE",
}

export enum NumberEnum {
	ONE = 1,
	TWO = 2,
	THREE = 3,
	FOUR = 4,
}

export enum Letter {
	A = "A",
	B = "B",
	C = "C",
	D = "D",
}

export enum Shape {
	SQUARE = "SQUARE",
	CIRCLE = "CIRCLE",
	DIAMOND = "DIAMOND",
	TRIANGLE = "TRIANGLE",
}

export interface ShapeOption {
	name: Shape;
	icon: LucideIcon;
}

export interface ColorOption {
	hexcode: string;
	name: Color;
}

export interface NumberOption {
	numAsString: NumberEnum;
	num: Number;
}

export const colorOptions: ColorOption[] = [
	{
		hexcode: "#00FF00",
		name: Color.GREEN,
	},
	{
		hexcode: "#FFFF00",
		name: Color.YELLOW,
	},
	{
		hexcode: "#FF0000",
		name: Color.RED,
	},
	{
		hexcode: "#0000FF",
		name: Color.BLUE,
	},
];

export const shapeOptions: ShapeOption[] = [
	{
		name: Shape.SQUARE,
		icon: Square,
	},
	{
		name: Shape.CIRCLE,
		icon: Circle,
	},
	{
		name: Shape.DIAMOND,
		icon: Diamond,
	},
	{
		name: Shape.TRIANGLE,
		icon: Triangle,
	},
];

export const numOptions: NumberOption[] = [
	{ numAsString: NumberEnum.ONE, num: 1 },
	{ numAsString: NumberEnum.TWO, num: 2 },
	{ numAsString: NumberEnum.THREE, num: 3 },
	{ numAsString: NumberEnum.FOUR, num: 4 },
];

export const letterOptions: Letter[] = [Letter.A, Letter.B, Letter.C, Letter.D];
