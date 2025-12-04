# 🎵 Metronome Feature - Quick Reference

## 📋 Quick Start Checklist

-   [ ] Add `metronome-tick.mp3` to `frontend/assets/sounds/`
-   [ ] Run `npm start` or `npx expo start`
-   [ ] Test on device/emulator
-   [ ] Navigate to any exercise → Settings
-   [ ] Enable metronome and adjust BPM
-   [ ] Start exercise and verify audio + visual indicator

## 🎯 Key Features

| Feature              | Details                  |
| -------------------- | ------------------------ |
| **BPM Range**        | 30 - 300                 |
| **Default BPM**      | 120                      |
| **Volume Range**     | 0.0 - 1.0                |
| **Default Volume**   | 0.7                      |
| **Quick Presets**    | 60, 90, 120, 150, 180    |
| **Visual Indicator** | ✅ Yes (top of screen)   |
| **Auto Start**       | ✅ Yes (after countdown) |
| **Auto Stop**        | ✅ Yes (on exit)         |

## 🎼 BPM Guide

| BPM     | Description | Use Case                                 |
| ------- | ----------- | ---------------------------------------- |
| 40-60   | Very Slow   | Warm-up, meditation, slow drills         |
| 60-90   | Slow        | Beginner exercises, technique practice   |
| 90-120  | Moderate    | Standard training, coordination drills   |
| 120-150 | Fast        | Intermediate exercises, agility training |
| 150-180 | Very Fast   | Advanced drills, speed training          |
| 180+    | Extreme     | Expert level, reaction time challenges   |

## 🔧 API Quick Reference

### Start Metronome

```typescript
import MetronomeService from "@/services/MetronomeService";

await MetronomeService.start({
	bpm: 120,
	volume: 0.7,
	soundEnabled: true,
});
```

### Stop Metronome

```typescript
await MetronomeService.stop();
```

### Change BPM

```typescript
await MetronomeService.setBPM(140);
```

### Listen to Beats

```typescript
const unsubscribe = MetronomeService.onBeat((beatNumber) => {
	console.log(`Beat ${beatNumber}`);
});

// Later: unsubscribe();
```

## 🎨 UI Components

### MetronomeControl (Full)

```tsx
<MetronomeControl
	settings={{ enabled: true, bpm: 120, volume: 0.7 }}
	onChange={setSettings}
	showVisualIndicator={true}
	compact={false}
/>
```

### MetronomeControl (Compact)

```tsx
<MetronomeControl settings={settings} onChange={setSettings} compact={true} />
```

### MetronomeIndicator

```tsx
<MetronomeIndicator
	position="top" // or "center" or "bottom"
	color="#10b981" // green
	size={20} // pixels
/>
```

## 🗂️ File Locations

```
frontend/
├── app/
│   ├── services/
│   │   └── MetronomeService.ts       ← Core engine
│   ├── components/
│   │   ├── MetronomeControl.tsx      ← Settings UI
│   │   └── MetronomeIndicator.tsx    ← Visual overlay
│   ├── hooks/
│   │   └── useMetronome.ts           ← React hook
│   └── (protected)/(exercise)/
│       ├── settings.tsx              ← Settings page
│       └── exercise.tsx              ← Execution page
└── assets/
    └── sounds/
        └── metronome-tick.mp3        ⚠️ ADD THIS FILE

Documentation/
├── METRONOME_IMPLEMENTATION_SUMMARY.md  ← Full summary
├── METRONOME_FEATURE_DOCUMENTATION.md   ← Complete docs
└── METRONOME_SETUP.md                   ← Setup guide
```

## 📱 User Flow

```
1. User opens exercise
   ↓
2. Taps "Customize this exercise"
   ↓
3. Scrolls to "Metronome" section
   ↓
4. Toggles metronome ON
   ↓
5. Adjusts BPM (e.g., 120)
   ↓
6. Adjusts volume (e.g., 0.7)
   ↓
7. Saves settings
   ↓
8. Returns to exercise page
   ↓
9. Starts exercise
   ↓
10. Countdown: 5...4...3...2...1
   ↓
11. Metronome starts automatically
   ↓
12. Audio plays + Visual indicator pulses
   ↓
13. Exercise completes OR user stops
   ↓
14. Metronome stops automatically
```

## 🐛 Troubleshooting

| Problem                      | Solution                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| No sound                     | • Add `metronome-tick.mp3` file<br>• Check device volume<br>• Disable silent mode                      |
| App crashes                  | • Verify audio file exists<br>• Check file path is correct<br>• Ensure valid MP3 format                |
| Wrong tempo                  | • Verify BPM setting in exercise settings<br>• Check metronome is enabled                              |
| Visual indicator not showing | • Ensure metronome is enabled<br>• Check exercise is running<br>• Verify not covered by other elements |

## 🌍 Translations

| Key                 | English           | French           | Japanese         |
| ------------------- | ----------------- | ---------------- | ---------------- |
| `metronome.title`   | Metronome         | Métronome        | メトロノーム     |
| `metronome.tempo`   | Tempo (BPM)       | Tempo (BPM)      | テンポ (BPM)     |
| `metronome.volume`  | Volume            | Volume           | 音量             |
| `metronome.enabled` | Metronome Enabled | Métronome activé | メトロノーム有効 |

## 📊 Data Structure

```typescript
// Redux State
customizedExercises: {
  [exerciseId]: {
    exerciseTime: 150,
    offScreenTime: 0.5,
    onScreenTime: 1,
    metronome: {              // ← New!
      enabled: true,
      bpm: 120,
      volume: 0.7
    }
  }
}
```

## ⚡ Performance Tips

-   ✅ Metronome is a singleton (one instance per app)
-   ✅ Audio is pre-loaded (minimal latency)
-   ✅ Automatic cleanup prevents memory leaks
-   ✅ Visual animations use native driver (60fps)
-   ✅ Event-based updates are efficient

## 🎯 Testing Checklist

-   [ ] Enable metronome in settings
-   [ ] Adjust BPM to 60 (slow) - verify tempo
-   [ ] Adjust BPM to 180 (fast) - verify tempo
-   [ ] Adjust volume to 0.3 - verify quiet
-   [ ] Adjust volume to 1.0 - verify loud
-   [ ] Start exercise - metronome starts after countdown
-   [ ] Stop exercise early - metronome stops
-   [ ] Navigate away - metronome stops
-   [ ] Disable metronome - no sound on next exercise
-   [ ] Re-enable - sound returns

## 📚 Documentation

-   **Complete Docs**: `METRONOME_FEATURE_DOCUMENTATION.md`
-   **Setup Guide**: `METRONOME_SETUP.md`
-   **Summary**: `METRONOME_IMPLEMENTATION_SUMMARY.md`
-   **This Card**: `METRONOME_QUICK_REFERENCE.md`

---

**Version**: 1.0  
**Date**: November 30, 2025  
**Status**: ✅ Complete (add audio file to test)
