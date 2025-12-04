# Metronome Feature - System Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cogimat App                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────┐
│   Exercise   │    │   Exercise       │    │   Redux     │
│   Settings   │    │   Execution      │    │   Store     │
│   Page       │    │   Page           │    │             │
└──────────────┘    └──────────────────┘    └─────────────┘
        │                     │                     │
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────┐
│  Metronome   │    │   Metronome      │    │  data       │
│  Control     │    │   Indicator      │    │  Slice      │
│  Component   │    │   Component      │    │             │
└──────────────┘    └──────────────────┘    └─────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Metronome       │
                    │  Service         │
                    │  (Singleton)     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  expo-av         │
                    │  Audio API       │
                    └──────────────────┘
```

## Data Flow

```
User Interaction Flow:
──────────────────────

1. USER CONFIGURES
   User → Exercise Settings → MetronomeControl
   │
   ├─ Enable/Disable Toggle
   ├─ BPM Adjustment (+/-, Presets)
   └─ Volume Slider
   │
   ▼
   Redux Store (customizedExercises)
   │
   ▼
   Persisted per Exercise

2. USER STARTS EXERCISE
   User → Start Exercise Button
   │
   ▼
   Exercise Page Loads
   │
   ├─ Read metronome settings from Redux
   ├─ Wait for countdown (5s)
   └─ Exercise begins
   │
   ▼
   useEffect Hook Triggered
   │
   ▼
   MetronomeService.start({
     bpm: settings.bpm,
     volume: settings.volume,
     soundEnabled: true
   })
   │
   ▼
   Audio Playback Begins
   │
   ├─ Sound plays at interval: (60/BPM) * 1000 ms
   └─ Beat events emitted
   │
   ▼
   MetronomeIndicator receives beat events
   │
   └─ Visual pulse animation

3. USER STOPS EXERCISE
   User → Stop/Exit Button
   │
   ▼
   Component Cleanup (useEffect)
   │
   ▼
   MetronomeService.stop()
   │
   ├─ Clear interval
   ├─ Stop audio
   └─ Reset state
```

## Service Architecture

```
MetronomeService (Singleton)
═══════════════════════════

┌─────────────────────────────────────────┐
│         MetronomeService                │
│                                         │
│  State:                                 │
│  ├─ isPlaying: boolean                  │
│  ├─ currentBeat: number                 │
│  ├─ bpm: number                         │
│  ├─ volume: number                      │
│  ├─ soundEnabled: boolean               │
│  ├─ soundObject: Sound | null           │
│  └─ callbacks: Function[]               │
│                                         │
│  Methods:                               │
│  ├─ start(config)                       │
│  ├─ stop()                              │
│  ├─ pause()                             │
│  ├─ resume()                            │
│  ├─ setBPM(bpm)                         │
│  ├─ setVolume(volume)                   │
│  ├─ setSoundEnabled(enabled)            │
│  ├─ onBeat(callback)                    │
│  └─ getState()                          │
│                                         │
└─────────────────────────────────────────┘
              │
              ├─ Interval Timer (setInterval)
              │  └─ tick() every (60/BPM)*1000 ms
              │
              ├─ Audio Object (expo-av Sound)
              │  └─ Pre-loaded metronome-tick.mp3
              │
              └─ Event Callbacks
                 └─ Notify subscribers on each beat
```

## State Management

```
Redux State Structure
═══════════════════════

store/
└─ data/
   └─ dataSlice
      └─ customizedExercises: {
           [exerciseId: number]: {
             exerciseTime: number,
             offScreenTime: number,
             onScreenTime: number,
             metronome: {              ← NEW
               enabled: boolean,
               bpm: number,
               volume: number
             }
           }
         }

Actions:
├─ updateExercise(exerciseId, options)
│  └─ Saves metronome settings per exercise
│
└─ getExerciseCustomizedOptions(exercise, customizedExercises)
   └─ Retrieves settings with defaults
```

## Component Interaction

```
Exercise Settings Page
═══════════════════════

┌────────────────────────────────────────┐
│  Exercise Settings                     │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Duration Settings               │ │
│  │  • Off Screen Time               │ │
│  │  • On Screen Time                │ │
│  │  • Exercise Time                 │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Metronome                       │ │
│  │  ┌────────────────────────────┐  │ │
│  │  │  MetronomeControl          │  │ │
│  │  │                            │  │ │
│  │  │  [●] Enabled               │  │ │
│  │  │                            │  │ │
│  │  │  Tempo (BPM)               │  │ │
│  │  │  [-]  [120]  [+]           │  │ │
│  │  │  [60][90][120][150][180]   │  │ │
│  │  │                            │  │ │
│  │  │  Volume                    │  │ │
│  │  │  [────●────────]           │  │ │
│  │  │                            │  │ │
│  │  └────────────────────────────┘  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [Cancel]              [Save]          │
└────────────────────────────────────────┘
         │
         │ onChange
         ▼
   setMetronomeSettings()
         │
         │ onSave
         ▼
   dispatch(updateExercise({
     exerciseId,
     options: { ...durationSettings, metronome }
   }))
```

## Exercise Execution Flow

```
Exercise Execution
═══════════════════

┌────────────────────────────────────────┐
│  Exercise Page                         │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Header                          │ │
│  └──────────────────────────────────┘ │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │    ● ← MetronomeIndicator        │ │  ← Pulses with beats
│  │                                  │ │
│  │  ┌────────────────────────────┐ │ │
│  │  │                            │ │ │
│  │  │   Exercise Component       │ │ │
│  │  │   (SimpleStimulus, etc)    │ │ │
│  │  │                            │ │ │
│  │  │        [ 🔴 ]              │ │ │
│  │  │                            │ │ │
│  │  └────────────────────────────┘ │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘

Lifecycle:
1. Component mounts
2. Load exercise + customized options
3. Show countdown (5s)
4. useEffect detects countdown complete
5. Start metronome if enabled
6. Visual indicator begins pulsing
7. Exercise runs
8. Component unmounts OR user exits
9. useEffect cleanup → stop metronome
```

## Timing Precision

```
Beat Generation
═══════════════

Target BPM: 120
Target Interval: (60 / 120) * 1000 = 500ms

Timeline:
─────────────────────────────────────────────────
t=0ms      t=500ms    t=1000ms   t=1500ms   t=2000ms
  │          │          │          │          │
  ▼          ▼          ▼          ▼          ▼
 TICK       TICK       TICK       TICK       TICK
  │          │          │          │          │
  ├─ Play   ├─ Play    ├─ Play    ├─ Play    ├─ Play
  │  Audio  │  Audio   │  Audio   │  Audio   │  Audio
  │          │          │          │          │
  ├─ Emit   ├─ Emit    ├─ Emit    ├─ Emit    ├─ Emit
  │  Event  │  Event   │  Event   │  Event   │  Event
  │          │          │          │          │
  └─ Update └─ Update  └─ Update  └─ Update  └─ Update
     Visual    Visual     Visual     Visual     Visual

Actual Precision: ±10-20ms (JavaScript timing variance)
```

## Audio Pipeline

```
Audio Processing
════════════════

1. App Initialization
   │
   ▼
   MetronomeService constructor
   │
   ▼
   initializeAudio()
   │
   ├─ Set audio mode (silent mode compatible)
   └─ Pre-load metronome-tick.mp3
   │
   ▼
   soundObject ready (not playing)

2. Metronome Start
   │
   ▼
   start({ bpm, volume, soundEnabled })
   │
   ├─ Calculate interval: (60/bpm) * 1000
   └─ Set up setInterval
   │
   ▼
   First tick() executes immediately

3. Each Tick
   │
   ▼
   tick()
   │
   ├─ Reset audio position to 0
   ├─ Play sound (if enabled)
   ├─ Increment beat counter
   └─ Notify all callbacks
   │
   ▼
   Visual components update
   │
   ▼
   Wait for next interval

4. Metronome Stop
   │
   ▼
   stop()
   │
   ├─ Clear interval
   ├─ Stop audio playback
   ├─ Reset beat counter
   └─ Reset position to 0
```

## Error Handling

```
Error Scenarios
═══════════════

1. Missing Audio File
   MetronomeService.initializeAudio()
   │
   ├─ try/catch around Audio.Sound.createAsync
   │
   └─ Error: "Failed to initialize metronome audio"
   │
   ▼
   isInitialized = false
   │
   ▼
   Subsequent start() calls will retry initialization

2. Audio Playback Failure
   tick()
   │
   ├─ try/catch around playAsync()
   │
   └─ Error: "Error playing metronome tick"
   │
   ▼
   Log error, continue (don't crash)

3. Invalid BPM
   setBPM(bpm)
   │
   ├─ if (bpm < 30 || bpm > 300)
   │
   └─ console.warn() and return early
   │
   ▼
   No action taken
```

## Memory Management

```
Cleanup Strategy
════════════════

1. Component Unmount
   useEffect cleanup function
   │
   ▼
   MetronomeService.stop()
   │
   ├─ Clear interval (prevent memory leak)
   ├─ Stop audio
   └─ Reset state

2. Service Cleanup
   MetronomeService.cleanup()
   │
   ├─ Stop metronome
   ├─ Unload audio
   ├─ Clear all callbacks
   └─ Reset initialization flag

3. Callback Management
   onBeat(callback)
   │
   ├─ Add to callbacks array
   │
   └─ Return unsubscribe function
   │
   ▼
   Component calls unsubscribe on unmount
   │
   └─ Remove from callbacks array
```

## Performance Optimization

```
Optimization Techniques
═══════════════════════

1. Singleton Pattern
   ✓ One MetronomeService instance per app
   ✓ Prevents multiple metronomes playing
   ✓ Shared state across components

2. Pre-loaded Audio
   ✓ Sound loaded at initialization
   ✓ No load delay on play
   ✓ Position reset instead of reload

3. Native Animations
   ✓ Visual indicator uses useNativeDriver
   ✓ 60fps smooth animations
   ✓ No JS bridge blocking

4. Event-Based Updates
   ✓ Callbacks only notify subscribers
   ✓ No polling or unnecessary checks
   ✓ Efficient re-renders

5. Memoization
   ✓ React hooks with proper dependencies
   ✓ Prevents unnecessary re-calculations
   ✓ Optimized component updates
```

---

**This diagram shows the complete architecture of the metronome system.**  
For implementation details, see `METRONOME_FEATURE_DOCUMENTATION.md`
