import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { useTheme } from "@/components/ui/ThemeProvider";
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Brain, FileChartColumn, UsersRound, ClipboardPen, Trophy, Rocket, Sprout } from "lucide-react-native";

const icons = {
	FileChartColumn,
	Brain,
	UsersRound,
	ClipboardPen,
	Trophy,
	Rocket,
	Sprout,
};
type IconName = keyof typeof icons;

export interface TabItem {
	title: string;
	iconName?: IconName;
	content: React.ReactNode;
}

export interface TabComponentProps {
	tabs: TabItem[];
	tabVariant: "link" | "outline" | "solid" | undefined;
	iconTop: boolean;
	roundedFull?: boolean;
	buttonIconHeight?: number;
}

export default function TabComponent(props: TabComponentProps) {
	const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
	const { themeTextColor } = useTheme();

	const handleTabPress = (index: number) => {
		setActiveTabIndex(index);
	};

	return (
		<View className="w-full flex justify-center items-center">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ alignItems: "center" }}
				className="py-3 w-[90%]"
			>
				{props.tabs.map((tab, index) => {
					const IconComponent = tab.iconName ? icons[tab.iconName] : undefined;
					return (
						<React.Fragment key={index}>
							{index > 0 && <View className="w-px self-center mx-1" />}
							<Button
								variant={props.tabVariant}
								className={`flex-1 items-center px-2 gap-2 ${props.iconTop ? "flex-col" : ""} ${props.roundedFull ? "rounded-full" : ""}`}
								action={index === activeTabIndex ? "primary" : "secondary"}
								onPress={() => handleTabPress(index)}
							>
								{IconComponent && (
									<ButtonIcon
										as={IconComponent}
										height={props.buttonIconHeight}
										action="negative"
										className={`${index === activeTabIndex ? "stroke-primary-500" : "stroke-secondary-950"}`}
									/>
								)}
								<ButtonText
									numberOfLines={1}
									ellipsizeMode="tail"
									action={index === activeTabIndex ? "primary" : "secondary"}
									className="w-[80px]"
								>
									{tab.title}
								</ButtonText>
							</Button>
						</React.Fragment>
					);
				})}
			</ScrollView>
			<View className="w-[90%]">{props.tabs[activeTabIndex]?.content}</View>
		</View>
	);
}
