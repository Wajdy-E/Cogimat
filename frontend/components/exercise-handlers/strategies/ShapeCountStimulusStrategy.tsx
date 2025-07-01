import React from 'react';
import { View } from 'react-native';
import { Square, Circle, Triangle, Diamond, LucideIcon } from 'lucide-react-native';
import { Exercise } from '../../../store/data/dataSlice';
import { StimulusStrategy } from '../UnifiedStimulus';

interface ShapeStimulus {
	type: string;
	color: string;
	icon: LucideIcon;
}

const generateRandomStimulus = (): ShapeStimulus[] => {
	const shapeTemplates: ShapeStimulus[] = [
		{ type: 'SQUARE', color: '#FF0000', icon: Square },
		{ type: 'CIRCLE', color: '#FFFF00', icon: Circle },
		{ type: 'TRIANGLE', color: '#00FF00', icon: Triangle },
		{ type: 'DIAMOND', color: '#0000FF', icon: Diamond },
	];

	const count = Math.floor(Math.random() * 3) + 2; // 2 to 4 shapes
	const selectedShapes = shapeTemplates.sort(() => 0.5 - Math.random()).slice(0, count);

	const expanded: ShapeStimulus[] = [];
	selectedShapes.forEach((shape) => {
		const shapeCount = Math.floor(Math.random() * 5) + 1; // 1–5 of each
		for (let i = 0; i < shapeCount; i++) {
			expanded.push({ ...shape });
		}
	});

	// Shuffle all shapes randomly
	for (let i = expanded.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[expanded[i], expanded[j]] = [expanded[j], expanded[i]];
	}

	return expanded;
};

export const ShapeCountStimulusStrategy: StimulusStrategy = {
	generateStimulus: (exercise: Exercise) => {
		return generateRandomStimulus();
	},

	renderStimulus: (stimulus: any, isWhiteScreen: boolean) => {
		if (isWhiteScreen) {
			return <View className="absolute inset-0 bg-white" />;
		}

		if (!stimulus || !Array.isArray(stimulus) || !stimulus.length) {
			return null;
		}

		return (
			<View className="absolute inset-0 justify-center items-center bg-background-700 px-6">
				<View className="flex-row flex-wrap justify-center items-center gap-4 max-w-[90%]">
					{stimulus.map((shape: ShapeStimulus, idx: number) => {
						const Icon = shape.icon;
						return <Icon key={idx} size={80} color={shape.color} fill={shape.color} />;
					})}
				</View>
			</View>
		);
	},

	getProgressData: (stimulusCount: Map<string, number>) => {
		return Array.from(stimulusCount.entries()).map(([shapeType, count]) => ({
			Shape: shapeType,
			Count: count,
		}));
	},

	getTableHeaders: () => ['exerciseProgress.shape', 'exerciseProgress.count'],

	incrementStimulusCount: (
		stimulus: any,
		setStimulusCount: React.Dispatch<React.SetStateAction<Map<string, number>>>,
	) => {
		if (!Array.isArray(stimulus)) {
			return;
		}

		const shapeCounts = new Map<string, number>();
		stimulus.forEach((shape: ShapeStimulus) => {
			shapeCounts.set(shape.type, (shapeCounts.get(shape.type) || 0) + 1);
		});

		setStimulusCount((prev) => {
			const newMap = new Map(prev);
			shapeCounts.forEach((count, type) => {
				newMap.set(type, (newMap.get(type) || 0) + count);
			});
			return newMap;
		});
	},
};
