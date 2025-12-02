/**
 * Translation utilities for variable substitution
 */

/**
 * Replace variables in translation strings
 * Variables are defined as {{variableName}} in translation strings
 * 
 * @example
 * interpolate("Hello {{name}}!", { name: "Alice" }) // "Hello Alice!"
 * interpolate("{{count}} players", { count: 5 }) // "5 players"
 */
export function interpolate(
    template: string,
    variables?: Record<string, string | number>
): string {
    if (!variables) return template;

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = variables[key];
        return value !== undefined ? String(value) : match;
    });
}

/**
 * Get nested translation value from translation object
 * Supports dot notation paths like "game.playerKilled"
 */
export function getTranslation(
    translations: any,
    path: string
): string | undefined {
    return path.split('.').reduce((obj, key) => obj?.[key], translations);
}

/**
 * Translation helper that combines path lookup and variable substitution
 * 
 * @example
 * t(translations.de, "game.playerKilled", { player: "Alice" })
 * // Returns: "Alice wurde getötet!"
 */
export function t(
    translations: any,
    path: string,
    variables?: Record<string, string | number>
): string {
    const template = getTranslation(translations, path);
    if (!template) return path; // Return path as fallback
    return interpolate(template, variables);
}
