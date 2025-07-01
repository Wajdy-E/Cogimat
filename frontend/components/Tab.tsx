import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { useTheme } from '@/components/ui/ThemeProvider';
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Brain, FileChartColumn, UsersRound, ClipboardPen, Trophy, Rocket, Sprout } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setActiveTabIndex } from '../store/ui/uiSlice';

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
	tabVariant: 'link' | 'outline' | 'solid' | undefined;
	iconTop: boolean;
	roundedFull?: boolean;
	buttonIconHeight?: number;
	context?: string;
}

export default function TabComponent (props: TabComponentProps) {
	const context = props.context || 'default';
	const activeTabIndex = useSelector((state: RootState) => {
		try {
			if (!state || !state.ui || !state.ui.activeTabIndices) {
				return 0;
			}
			const tabIndex = state.ui.activeTabIndices[context];
			return typeof tabIndex === 'number' ? tabIndex : 0;
		} catch (error) {
			console.warn('Error accessing tab state:', error);
			return 0;
		}
	});
	const dispatch = useDispatch();
	const { themeTextColor } = useTheme();

	const handleTabPress = (index: number) => {
		try {
			dispatch(setActiveTabIndex({ context, index }));
		} catch (error) {
			console.warn('Error dispatching tab action:', error);
		}
	};

	return (
		<View className="w-full flex justify-center items-center">
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ alignItems: 'center' }}
				className="py-3 w-[90%] self-center"
			>
				{props.tabs.map((tab, index) => {
					const IconComponent = tab.iconName ? icons[tab.iconName] : undefined;
					return (
						<React.Fragment key={index}>
							{index > 0 && <View className="w-px self-center mx-1" />}
							<Button
								variant={props.tabVariant}
								className={`flex flex-1 items-center px-2 gap-2 ${props.iconTop ? 'flex-col' : ''} ${props.roundedFull ? 'rounded-full' : ''}`}
								action={index === activeTabIndex ? 'primary' : 'secondary'}
								onPress={() => handleTabPress(index)}
							>
								{IconComponent && (
									<ButtonIcon
										as={IconComponent}
										height={props.buttonIconHeight}
										action="negative"
										className={`${index === activeTabIndex ? 'stroke-primary-500' : 'stroke-secondary-950'}`}
									/>
								)}
								<ButtonText
									numberOfLines={1}
									ellipsizeMode="tail"
									action={index === activeTabIndex ? 'primary' : 'secondary'}
									className="max-w-[110px]"
									size="lg"
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
