import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText, ButtonIcon } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { i18n } from "../i18n";
import { Crown } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { useDispatch } from "react-redux";
import { setPaywallModalPopup } from "@/store/data/dataSlice";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

export default function UpgradeCard() {
	const dispatch = useDispatch();

	return (
		<Card
			variant="outline"
			className="w-full rounded-xl overflow-hidden p-0"
			style={{
				borderWidth: 1,
				borderColor: 'rgba(0, 0, 0, 0.2)',
			}}
		>
			<LinearGradient
				colors={['#9333EA', '#7C3AED', '#6D28D9']} // Purple gradient: lighter to darker
				start={{ x: 0.8, y: 0.8 }} // Bottom left
				end={{ x: 0.2, y: 0.2 }} // Top right
				style={{
					padding: 20,
					position: 'relative',
					borderRadius: 10,
				}}
			>
				{/* Background Crown Graphic */}
				<View
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
						opacity: 0.15,
					}}
				>
					<Icon as={Crown} size="xl" className="text-white" style={{ width: 120, height: 120 }} />
				</View>

				<VStack space="lg" style={{ position: 'relative', zIndex: 1 }}>
					{/* Title with Crown Icon */}
					<HStack space="sm" className="items-center">
						<Icon 
							as={Crown} 
							size="xl" 
							style={{ color: '#FCD34D' }} // Yellow/gold color
							fill="#FCD34D"
						/>
						<Heading size="xl" className="text-white font-bold">
							{i18n.t("upgradeCard.title")}
						</Heading>
					</HStack>

					{/* Description */}
					<Text size="md" className="text-white">
						{i18n.t("upgradeCard.description")}
					</Text>

					{/* Upgrade Button */}
					<Button
						variant="solid"
						size="md"
						onPress={() => dispatch(setPaywallModalPopup(true))}
						className="rounded-xl self-start"
						style={{
							backgroundColor: '#FFFFFF',
						}}
					>
						<ButtonText 
							style={{
								color: '#9333EA', // Purple text
								fontWeight: '600',
							}}
						>
							{i18n.t("upgradeCard.button")}
						</ButtonText>
					</Button>
				</VStack>
			</LinearGradient>
		</Card>
	);
}
