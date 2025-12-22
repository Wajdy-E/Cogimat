// components/exerciseHandlers/ShapeCountStimulus.tsx

import React from "react";
import { Exercise } from "@/store/data/dataSlice";
import UnifiedStimulus from "./UnifiedStimulus";
import { ShapeCountStimulusStrategy } from "./strategies";

export default function ShapeCountStimulus({
	exercise,
	onComplete,
	onStop,
	forcePause,
}: {
	exercise: Exercise;
	onComplete?: () => void;
	onStop?: () => void;
	forcePause?: boolean;
}) {
	return (
		<UnifiedStimulus
			exercise={exercise}
			onComplete={onComplete}
			onStop={onStop}
			strategy={ShapeCountStimulusStrategy}
			forcePause={forcePause}
		/>
	);
}
