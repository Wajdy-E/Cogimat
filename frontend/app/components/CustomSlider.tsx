import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Slider, SliderThumb, SliderTrack, SliderFilledTrack } from "@/components/ui/slider";
import { Text } from "@/components/ui/text";
import { ISliderProps } from "@gluestack-ui/slider/lib/types";
import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { i18n } from "../i18n";
import type { LucideIcon } from "lucide-react-native";

export interface Size {
	size: "sm" | "md" | "lg" | undefined;
}

export interface CustomSliderProps extends ISliderProps {
	title?: string;
	suffix?: string;
	prefix?: string;
	width?: number;
	height?: number;
	isReadOnly?: boolean;
	showTimeRangeStyle?: boolean;
	icon?: LucideIcon;
}
export default function CustomSlider(props: CustomSliderProps & Size) {
	const [currentValue, setCurrentValue] = useState(props.value || props.defaultValue || 0);

	// Update currentValue when props.value changes
	useEffect(() => {
		if (props.value !== undefined) {
			setCurrentValue(props.value);
		}
	}, [props.value]);

	const handleChange = (value: number) => {
		setCurrentValue(value);
		if (props.onChange) {
			props.onChange(value);
		}
	};

	const formatValue = (value: number) => {
		const formatted = value.toFixed(1);
		return formatted.endsWith('.0') ? formatted.slice(0, -2) : formatted;
	};

	const formatSuffix = (suffix?: string) => {
		if (!suffix) return '';
		const suffixText = i18n.t(suffix);
		return suffixText === suffix ? suffixText : suffixText.toLowerCase();
	};

	if (props.showTimeRangeStyle) {
		const minValue = props.minValue ?? 0;
		const maxValue = props.maxValue ?? 100;
		const suffixText = formatSuffix(props.suffix);
		const IconComponent = props.icon;
		
		return (
			<Box className="w-full">
				{/* Label with icon */}
				<View className="flex-row items-center gap-2 mb-3">
					{IconComponent && (
						<IconComponent size={16} color="#57CEB8" strokeWidth={2} />
					)}
					{props.title && <Heading size="sm">{i18n.t(props.title)}</Heading>}
				</View>

				{/* Slider with min/max labels */}
				<View className="relative w-full">
					<Slider
						defaultValue={props.defaultValue}
						size={props.size}
						orientation={props.orientation}
						isDisabled={props.isDisabled}
						isReversed={props.isReversed}
						onChange={handleChange}
						sliderTrackHeight={props.sliderTrackHeight}
						step={props.step}
						isReadOnly={props.isReadOnly}
						minValue={minValue}
						maxValue={maxValue}
						value={currentValue}
						className="w-full"
					>
						<SliderTrack>
							<SliderFilledTrack />
						</SliderTrack>
						<SliderThumb />
					</Slider>
					
					{/* Min and Max labels at track ends */}
					<View className="flex-row justify-between mt-3">
						<Text className="text-xs text-typography-500">
							{formatValue(minValue)} {suffixText}
						</Text>
						<Text className="text-xs text-typography-500">
							{formatValue(maxValue)} {suffixText}
						</Text>
					</View>
				</View>

				{/* Current value displayed below slider */}
				<View className="items-center mt-1">
					<Text className="text-primary-500 font-semibold text-base">
						{formatValue(currentValue)} {suffixText}
					</Text>
				</View>
			</Box>
		);
	}

	// Original layout
	return (
		<Box className="flex-row justify-between items-center">
			<View>{props.title && <Heading size="sm">{i18n.t(props.title)}</Heading>}</View>
			<Center style={{ width: props.width || 150, height: props.height || 20 }} className="gap-4">
				<Text>
					{props.prefix && `${i18n.t(props.prefix)} `}
					{currentValue}
					{props.suffix && ` ${i18n.t(props.suffix)}`}
				</Text>
				<Slider
					defaultValue={props.defaultValue}
					size={props.size}
					orientation={props.orientation}
					isDisabled={props.isDisabled}
					isReversed={props.isReversed}
					onChange={handleChange}
					sliderTrackHeight={props.sliderTrackHeight}
					step={props.step}
					isReadOnly={props.isReadOnly}
					minValue={props.minValue}
					maxValue={props.maxValue}
					value={currentValue}
				>
					<SliderTrack>
						<SliderFilledTrack />
					</SliderTrack>
					<SliderThumb />
				</Slider>
			</Center>
		</Box>
	);
}
