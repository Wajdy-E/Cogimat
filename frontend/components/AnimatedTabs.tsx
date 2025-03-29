import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import Tab from "react-native-animated-tab";

interface AnimatedTabProps {
	options: string[];
	content: React.ReactNode[];
	height?: number;
	borderRadius?: number;
	activeBackgroundColor?: string;
	inactiveBackgroundColor?: string;
	activeLabelColor?: string;
	inactiveLabelColor?: string;
}

const AnimatedTabs: React.FC<AnimatedTabProps> = ({
	options,
	content,
	height = 30,
	borderRadius = 9,
	activeBackgroundColor = "white",
	inactiveBackgroundColor = "lightgray",
	activeLabelColor = "black",
	inactiveLabelColor = "gray",
}) => {
	const [selectedOption, setSelectedOption] = useState(options[0]);
	const activeIndex = options.indexOf(selectedOption);

	return (
		<View style={styles.wrapper}>
			<Tab
				options={options}
				selectedOption={selectedOption}
				onOptionPress={setSelectedOption}
				height={height}
				borderRadius={borderRadius}
				activeBackgroundColor={activeBackgroundColor}
				inactiveBackgroundColor={inactiveBackgroundColor}
				activeLabelColor={activeLabelColor}
				inactiveLabelColor={inactiveLabelColor}
			/>

			<View style={styles.content}>{content[activeIndex]}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		width: "100%",
	},
	content: {
		marginTop: 16,
		paddingHorizontal: 16,
	},
});

export default AnimatedTabs;
