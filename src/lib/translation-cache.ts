// Simple translation signature/hash for cache validation
// For demo purposes, we use JSON.stringify
// Later this could be migrated to database with proper hashing

export function createTranslationSignature(value: string | string[]): string {
  if (Array.isArray(value)) {
    return JSON.stringify(value).trim();
  }
  return JSON.stringify(value).trim();
}

export function hasTranslationChanged(
  currentValue: string | string[],
  savedSignature: string | undefined
): boolean {
  if (!savedSignature) {
    // No previous signature means this is new content
    return true;
  }
  const currentSignature = createTranslationSignature(currentValue);
  return currentSignature !== savedSignature;
}
