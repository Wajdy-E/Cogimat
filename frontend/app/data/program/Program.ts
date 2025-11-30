import {
	Triangle,
	Square,
	Diamond,
	Circle,
	ArrowRight,
	ArrowUp,
	ArrowDown,
	ArrowLeft,
	ArrowUpRight,
	ArrowUpLeft,
	ArrowDownRight,
	ArrowDownLeft,
	LucideIcon,
} from "lucide-react-native";

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
	FIVE = 5,
	SIX = 6,
	SEVEN = 7,
	EIGHT = 8,
	NINE = 9,
	TEN = 10,
}

export enum Letter {
	A = "A",
	B = "B",
	C = "C",
	D = "D",
	E = "E",
	F = "F",
	G = "G",
	H = "H",
	I = "I",
	J = "J",
	K = "K",
	L = "L",
	M = "M",
	N = "N",
	O = "O",
	P = "P",
	Q = "Q",
	R = "R",
	S = "S",
	T = "T",
	U = "U",
	V = "V",
	W = "W",
	X = "X",
	Y = "Y",
	Z = "Z",
}

export enum Shape {
	SQUARE = "SQUARE",
	CIRCLE = "CIRCLE",
	DIAMOND = "DIAMOND",
	TRIANGLE = "TRIANGLE",
}

export enum Arrow {
	RIGHT = "RIGHT",
	UP = "UP",
	DOWN = "DOWN",
	LEFT = "LEFT",
	UP_RIGHT = "UP_RIGHT",
	UP_LEFT = "UP_LEFT",
	DOWN_RIGHT = "DOWN_RIGHT",
	DOWN_LEFT = "DOWN_LEFT",
}

export interface ShapeOption {
	name: Shape;
	icon: LucideIcon;
}

export interface ArrowOption {
	name: Arrow;
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

export const arrowOptions: ArrowOption[] = [
	{
		name: Arrow.RIGHT,
		icon: ArrowRight,
	},
	{
		name: Arrow.UP,
		icon: ArrowUp,
	},
	{
		name: Arrow.DOWN,
		icon: ArrowDown,
	},
	{
		name: Arrow.LEFT,
		icon: ArrowLeft,
	},
	{
		name: Arrow.UP_RIGHT,
		icon: ArrowUpRight,
	},
	{
		name: Arrow.UP_LEFT,
		icon: ArrowUpLeft,
	},
	{
		name: Arrow.DOWN_RIGHT,
		icon: ArrowDownRight,
	},
	{
		name: Arrow.DOWN_LEFT,
		icon: ArrowDownLeft,
	},
];

export const numOptions: NumberOption[] = [
	{ numAsString: NumberEnum.ONE, num: 1 },
	{ numAsString: NumberEnum.TWO, num: 2 },
	{ numAsString: NumberEnum.THREE, num: 3 },
	{ numAsString: NumberEnum.FOUR, num: 4 },
	{ numAsString: NumberEnum.FIVE, num: 5 },
	{ numAsString: NumberEnum.SIX, num: 6 },
	{ numAsString: NumberEnum.SEVEN, num: 7 },
	{ numAsString: NumberEnum.EIGHT, num: 8 },
	{ numAsString: NumberEnum.NINE, num: 9 },
	{ numAsString: NumberEnum.TEN, num: 10 },
];

export const letterOptions: Letter[] = [
	Letter.A,
	Letter.B,
	Letter.C,
	Letter.D,
	Letter.E,
	Letter.F,
	Letter.G,
	Letter.H,
	Letter.I,
	Letter.J,
	Letter.K,
	Letter.L,
	Letter.M,
	Letter.N,
	Letter.O,
	Letter.P,
	Letter.Q,
	Letter.R,
	Letter.S,
	Letter.T,
	Letter.U,
	Letter.V,
	Letter.W,
	Letter.X,
	Letter.Y,
	Letter.Z,
];
