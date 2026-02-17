import React from "react";
import { View, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { setActiveTabIndex } from "@/store/ui/uiSlice";
import { Text } from "@/components/ui/text";
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
	context?: string;
}

export default function TabComponent(props: TabComponentProps) {
	const context = props.context || "default";
	const activeTabIndex = useSelector((state: RootState) => {
		try {
			if (!state || !state.ui || !state.ui.activeTabIndices) {
				return 0;
			}
			const tabIndex = state.ui.activeTabIndices[context];
			return typeof tabIndex === "number" ? tabIndex : 0;
		} catch (error) {
			console.warn("Error accessing tab state:", error);
			return 0;
		}
	});
	const dispatch = useDispatch();

	const handleTabPress = (index: number) => {
		try {
			dispatch(setActiveTabIndex({ context, index }));
		} catch (error) {
			console.warn("Error dispatching tab action:", error);
		}
	};

	return (
		<View className="w-full flex justify-center items-center">
			{/* Tab Navigation Container */}
			<View className="w-full mb-4 overflow-hidden border-2 border-outline-700 rounded-full">
				<View className="bg-background-700 p-2 flex-row items-center justify-between">
					{props.tabs.map((tab, index) => {
						const isActive = index === activeTabIndex;
						return (
							<Pressable
								key={index}
								onPress={() => handleTabPress(index)}
								className={`flex-1 py-1.5 px-2 rounded-full ${isActive ? "bg-primary-500" : ""}`}
							>
								<Text
									numberOfLines={1}
									ellipsizeMode="tail"
									className={`text-center ${isActive ? "text-white font-bold" : "text-typography-500"}`}
									size="md"
								>
									{tab.title}
								</Text>
							</Pressable>
						);
					})}
				</View>
			</View>
			<View className="w-full">{props.tabs[activeTabIndex]?.content}</View>
		</View>
	);
}
