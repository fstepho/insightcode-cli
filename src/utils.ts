// File: src/utils.ts

/**
 * A utility function to deeply merge two objects.
 * The source object's properties will overwrite the target object's properties.
 * This is useful for merging user-provided configuration with default settings.
 * @param target The target object to merge into.
 * @param source The source object to merge from.
 * @returns The merged object.
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (isObject(sourceValue)) {
        if (!(key in target)) {
          (output as Record<string, unknown>)[key] = sourceValue;
        } else {
          (output as Record<string, unknown>)[key] = deepMerge(targetValue as Record<string, unknown>, sourceValue as Partial<Record<string, unknown>>);
        }
      } else {
        (output as Record<string, unknown>)[key] = sourceValue;
      }
    });
  }

  return output;
}

/**
 * Helper function to check if a variable is a non-null object.
 */
function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Normalizes file paths for consistent cross-platform usage.
 * Converts Windows backslashes to forward slashes, removes leading './' and trailing '/',
 * and ensures relative paths (no leading '/').
 * 
 * @param filePath The file path to normalize
 * @returns The normalized file path
 * 
 * @example
 * normalizePath("./src/index.ts") → "src/index.ts"
 * normalizePath("src\\parser.ts") → "src/parser.ts"
 * normalizePath("/src/index.ts") → "src/index.ts"
 * normalizePath("src/utils/") → "src/utils"
 */
export function normalizePath(filePath: string): string {
  // 1. Convert Windows backslashes to forward slashes
  let normalized = filePath.replace(/\\/g, '/');
  
  // 2. Remove temporary analysis prefixes (temp-analysis/uuid/)
  const tempAnalysisMatch = normalized.match(/^temp-analysis\/[^\/]+\/(.+)$/);
  if (tempAnalysisMatch) {
    normalized = tempAnalysisMatch[1];
  }
  
  // 3. Remove leading './' if present
  if (normalized.startsWith('./')) {
    normalized = normalized.substring(2);
  }
  
  // 4. Remove trailing slashes
  if (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  
  // 5. Ensure relative path (no leading /)
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }
  
  return normalized;
}

/**
 * Normalizes project paths by removing temporary analysis prefixes
 * Examples:
 * normalizeProjectPath("temp-analysis/uuid") → "."
 * normalizeProjectPath("/Users/x/temp-analysis/uuid") → "."
 * normalizeProjectPath("/Users/x/myproject") → "myproject"
 */
export function normalizeProjectPath(projectPath: string): string {
  // 1. Convert Windows backslashes to forward slashes
  let normalized = projectPath.replace(/\\/g, '/');
  
  // 2. Handle temporary analysis directories
  if (normalized.includes('temp-analysis')) {
    // If it's a temp-analysis path, return "." to indicate current directory
    return '.';
  }
  
  // 3. Extract just the project name from full paths
  const pathParts = normalized.split('/');
  const projectName = pathParts[pathParts.length - 1];
  
  // 4. Return "." for current directory, otherwise return project name
  return projectName || '.';
}
