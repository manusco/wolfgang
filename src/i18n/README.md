# i18n (Internationalization) System

## Overview

WolfGang uses a comprehensive internationalization system supporting German (DE) and English (EN) with the following features:

- **Browser Language Auto-Detection**: Automatically detects user's browser language on first visit
- **Variable Substitution**: Dynamic text with placeholders for player names, counts, and other variables
- **Persistent Storage**: Language preference saved to localStorage
- **Type-Safe**: Full TypeScript support with compile-time checking

## Usage

### Basic Translation

```typescript
import { useLanguageStore } from './store/languageStore';
import { translations } from './i18n/translations';

function MyComponent() {
    const { language } = useLanguageStore();
    const t = translations[language];
    
    return <h1>{t.landing.title}</h1>;
}
```

### Variable Substitution

For dynamic text with variables, use the `interpolate` function:

```typescript
import { interpolate } from './i18n/utils';
import { translations } from './i18n/translations';

function WelcomeMessage({ playerName }: { playerName: string }) {
    const { language } = useLanguageStore();
    const t = translations[language];
    
    // Translation: "Welcome, {{name}}!" / "Willkommen, {{name}}!"
    return <p>{interpolate(t.game.welcome, { name: playerName })}</p>;
}
```

### Adding New Translations

1. **Add translation keys** to `src/i18n/translations.ts`:

```typescript
export const translations = {
    de: {
        game: {
            playerKilled: "{{player}} wurde getötet!",
            // ...
        }
    },
    en: {
        game: {
            playerKilled: "{{player}} was killed!",
            // ...
        }
    }
}
```

2. **Use in components**:

```typescript
const message = interpolate(t.game.playerKilled, { player: "Alice" });
// German: "Alice wurde getötet!"
// English: "Alice was killed!"
```

## Variable Syntax

Variables use double curly braces: `{{variableName}}`

- **Supported types**: `string`, `number`
- **Example**: `"{{count}} players"` → `"5 players"`

## Browser Language Detection

The system automatically detects the user's browser language on first visit:

- **English browsers** (`en-US`, `en-GB`, etc.) → English
- **All other languages** → German (default)
- **After first visit**: User's manual selection is saved to localStorage

### How it works

```typescript
// In languageStore.ts
function detectBrowserLanguage(): Language {
    const browserLang = navigator.language.toLowerCase();
    return browserLang.startsWith('en') ? 'en' : 'de';
}
```

## Language Toggle

Users can manually switch languages via the toggle button:

- **Location**: Top-right corner of every page
- **Icon**: 🇩🇪 / 🇬🇧 flag
- **Persistence**: Choice saved to localStorage as `language-storage`

## Translation Keys Structure

```typescript
{
    landing: {
        title: string,
        subtitle: string,
        // ...
    },
    lobby: {
        createGame: string,
        playerCount: "{{count}} / 20",  // Variable example
        // ...
    },
    game: {
        playerKilled: "{{player}} was killed!",  // Variable example
        welcome: "Welcome, {{name}}!",           // Variable example
        // ...
    },
    roles: {
        WOLF: string,
        VILLAGER: string,
        // ...
    },
    actions: {
        vote: string,
        heal: string,
        // ...
    }
}
```

## Utility Functions

### `interpolate(template, variables)`

Replaces `{{variableName}}` placeholders with values:

```typescript
interpolate("Hello {{name}}!", { name: "World" })
// Returns: "Hello World!"
```

### `getTranslation(translations, path)`

Gets nested translation value using dot notation:

```typescript
getTranslation(translations.de, "game.playerKilled")
// Returns: "{{player}} wurde getötet!"
```

### `t(translations, path, variables)`

Combines path lookup and variable substitution:

```typescript
t(translations.de, "game.playerKilled", { player: "Alice" })
// Returns: "Alice wurde getötet!"
```

## Examples

### Player Join Notification

```typescript
// Translation keys:
// de: "{{player}} ist beigetreten"
// en: "{{player}} joined"

<div>
    {interpolate(t.game.playerJoined, { player: "Bob" })}
</div>
// German: "Bob ist beigetreten"
// English: "Bob joined"
```

### Player Count Display

```typescript
// Translation key: "{{count}} / 20"

<span>
    {interpolate(t.lobby.playerCount, { count: 7 })}
</span>
// Output: "7 / 20"
```

### Welcome Message

```typescript
// de: "Willkommen, {{name}}!"
// en: "Welcome, {{name}}!"

<h2>
    {interpolate(t.game.welcome, { name: currentPlayer.name })}
</h2>
```

## Best Practices

1. **Always use translation keys**: Never hardcode user-facing text
2. **Use variables for dynamic content**: Player names, counts, dates
3. **Keep tone consistent**: Informal and fun in both languages
4. **Test both languages**: Verify text fits in UI layouts
5. **Type safety**: Let TypeScript catch missing translation keys

## File Structure

```
src/
├── i18n/
│   ├── translations.ts    # All translation strings
│   └── utils.ts          # Helper functions (interpolate, etc.)
└── store/
    └── languageStore.ts  # Zustand store with persistence
```

## Adding a New Language

To add support for a new language (e.g., French):

1. Update type in `languageStore.ts`:
```typescript
type Language = 'de' | 'en' | 'fr';
```

2. Add translations in `translations.ts`:
```typescript
export const translations = {
    de: { /* ... */ },
    en: { /* ... */ },
    fr: {
        landing: {
            title: "Meute d'Ombre",
            // ...
        }
    }
}
```

3. Update detection logic if needed
4. Add flag icon to `LanguageToggle.tsx`
