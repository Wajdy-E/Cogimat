import React from 'react';
import { Exercise } from '../../store/data/dataSlice';
import UnifiedStimulus from './UnifiedStimulus';
import { SimpleStimulusStrategy } from './strategies';

export default function SimpleStimulus ({
	exercise,
	onComplete,
	onStop,
}: {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
}) {
	return (
		<UnifiedStimulus exercise={exercise} onComplete={onComplete} onStop={onStop} strategy={SimpleStimulusStrategy} />
	);
}
