import { Button, ButtonText } from "@/components/ui/button";
import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";

export interface TabItem {
	title: string;
	icon?: React.ReactNode;
	content: React.ReactNode;
}

export interface TabComponentProps {
	tabs: TabItem[];
	tabVariant: "link" | "outline" | "solid" | undefined;
	iconTop: boolean;
}

export default function TabComponent(props: TabComponentProps) {
	const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

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
				{props.tabs.map((tab, index) => (
					<React.Fragment key={index}>
						{index > 0 && <View className="w-px  self-center mx-1" />}
						<Button
							variant={props.tabVariant}
							className={`flex-1 ${props.iconTop ? "flex-col" : ""} items-center px-2 gap-2`}
							onPress={() => handleTabPress(index)}
						>
							{React.isValidElement(tab.icon) &&
								React.cloneElement(tab.icon as React.ReactElement<any>, {
									strokeOpacity: index === activeTabIndex ? 1 : 0.7,
								})}

							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								className={`
									${index === activeTabIndex ? "text-white font-bold text-center" : "text-gray-200 text-center"}
                                    w-[80px]
								`}
							>
								{tab.title}
							</Text>
						</Button>
					</React.Fragment>
				))}
			</ScrollView>
			<View className="w-[90%]">{props.tabs[activeTabIndex]?.content}</View>
		</View>
	);
}
