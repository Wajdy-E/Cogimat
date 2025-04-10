import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Slider, SliderThumb, SliderTrack, SliderFilledTrack } from "@/components/ui/slider";
import { Text } from "@/components/ui/text";
import { ISliderProps } from "@gluestack-ui/slider/lib/types";
import { useState } from "react";
import { View } from "react-native";
import { i18n } from "../i18n";

export interface Size {
	size: "sm" | "md" | "lg" | undefined;
}

export interface CustomSliderProps extends ISliderProps {
	title?: string;
	suffix?: string;
	prefix?: string;
	width?: number;
	height?: number;
}
export default function CustomSlider(props: CustomSliderProps & Size) {
	const [currentValue, setCurrentValue] = useState(props.value || props.defaultValue || 0);
	const handleChange = (value: number) => {
		setCurrentValue(value);
		if (props.onChange) {
			props.onChange(value);
		}
	};

	return (
		<Box className="flex-row justify-between items-center">
			<View>{props.title && <Heading>{i18n.t(props.title)}</Heading>}</View>
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
