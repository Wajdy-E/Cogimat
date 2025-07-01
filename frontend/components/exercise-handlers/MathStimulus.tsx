// components/exerciseHandlers/MathStimulus.tsx

import React from 'react';
import { Exercise } from '../../store/data/dataSlice';
import UnifiedStimulus from './UnifiedStimulus';
import { MathStimulusStrategy } from './strategies';

export default function MathStimulus ({
	exercise,
	onComplete,
	onStop,
}: {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
}) {
	return (
		<UnifiedStimulus exercise={exercise} onComplete={onComplete} onStop={onStop} strategy={MathStimulusStrategy} />
	);
}
