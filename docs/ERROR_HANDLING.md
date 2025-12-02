# Error Handling Guidelines

## Overview
WolfGang uses a multi-layered approach to error handling to ensure a robust user experience.

## 1. Global Error Boundary
The entire application is wrapped in a React `ErrorBoundary` component (`src/components/ErrorBoundary.tsx`). This catches any errors that occur during rendering, lifecycle methods, or constructors in the component tree.

**Usage:**
Automatic. Any unhandled React error will display a user-friendly "Something went wrong" screen with a reload button.

## 2. API & Service Error Handling
All async operations (Firebase calls, game logic) must be wrapped in `try/catch` blocks.

**Pattern:**
```typescript
try {
    await someAsyncOperation();
} catch (err: any) {
    console.error('Operation failed:', err);
    // 1. Set UI error state
    setError(err.message || 'An unexpected error occurred');
    // 2. (Optional) Report to analytics/logging service
} finally {
    setIsLoading(false);
}
```

## 3. UI Error Feedback
Always provide visual feedback to the user when an error occurs.

**Components:**
- Use `AlertCircle` icon for error messages
- Display errors in red text/background containers
- Ensure error messages are translated (use i18n keys)

**Example:**
```tsx
{error && (
    <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-red-200">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
    </div>
)}
```

## 4. Firebase Error Handling
Firebase errors often contain technical codes. Map these to user-friendly messages where possible.

**Common Codes:**
- `permission-denied`: "You don't have permission to do that."
- `not-found`: "The requested resource was not found."
- `unavailable`: "Service is temporarily unavailable. Check your connection."

## 5. Console Logging
- Use `console.error` for critical errors
- Use `console.warn` for non-critical issues
- Include context objects when logging: `console.error('Game join failed:', { roomId, playerId, error })`
