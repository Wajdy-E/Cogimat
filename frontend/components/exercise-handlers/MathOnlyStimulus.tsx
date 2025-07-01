// components/exerciseHandlers/MathOnlyStimulus.tsx

import React from 'react';
import { Exercise } from '../../store/data/dataSlice';
import UnifiedStimulus from './UnifiedStimulus';
import { MathOnlyStimulusStrategy } from './strategies';

export default function MathOnlyStimulus ({
	exercise,
	onComplete,
	onStop,
}: {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
}) {
	return (
		<UnifiedStimulus exercise={exercise} onComplete={onComplete} onStop={onStop} strategy={MathOnlyStimulusStrategy} />
	);
}
