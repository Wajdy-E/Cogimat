# Language Switching Feature

## Overview

The app now supports multiple languages: English (en), French (fr), and Japanese (ja). Users can switch between languages in the Account settings.

## How It Works

### 1. Language Initialization

- On app startup, the language is automatically initialized from saved preferences
- If no saved preference exists, it falls back to the device's locale or English
- The language initialization happens in the main app layout before rendering

### 2. Language Switching

- Users can change the language in Account → App Settings → App Language
- The selection is immediately saved to AsyncStorage
- The app re-renders to reflect the new language

### 3. Persistence

- Language preference is saved to AsyncStorage with key `"app_language"`
- The preference persists across app restarts
- Supported values: "en", "fr", "ja"

## Implementation Details

### Files Modified:

1. **`i18n.js`** - Added French translations and language initialization utilities
2. **`app/_layout.tsx`** - Integrated language initialization on app startup
3. **`app/(tabs)/account.tsx`** - Added language switching functionality
4. **`app/hooks/useLanguageInitialization.ts`** - Created hook for language initialization

### Key Functions:

- `initializeLanguage()` - Loads saved language preference
- `handleLanguageChange()` - Handles language switching in account settings
- `useLanguageInitialization()` - Hook for app startup language loading

## Usage

### For Users:

1. Go to Account tab
2. Scroll to "App Settings" section
3. Tap "App Language"
4. Select desired language (🇬🇧 English, 🇫🇷 Français, 🇯🇵 日本語)
5. The app will immediately switch to the selected language

### For Developers:

```javascript
// Change language programmatically
import { i18n } from "../i18n";
i18n.locale = "fr"; // Switch to French

// Save language preference
import AsyncStorage from "@react-native-async-storage/async-storage";
await AsyncStorage.setItem("app_language", "fr");
```

## Adding New Languages

To add a new language:

1. Add translations to the `translations` object in `i18n.js`
2. Update the `initializeLanguage()` function to support the new language code
3. Add the language option to `languageOptions` in the account page
4. Update the `getLanguageLabel()` function to handle the new language

## Notes

- The app uses `i18n-js` for internationalization
- Language changes trigger a re-render to update all translated text
- Fallback to English is enabled for missing translations
