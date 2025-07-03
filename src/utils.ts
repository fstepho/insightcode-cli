// File: src/utils.ts

/**
 * A utility function to deeply merge two objects.
 * The source object's properties will overwrite the target object's properties.
 * This is useful for merging user-provided configuration with default settings.
 * @param target The target object to merge into.
 * @param source The source object to merge from.
 * @returns The merged object.
 */
export function deepMerge(target: any, source: any): any {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

/**
 * Helper function to check if a variable is a non-null object.
 */
function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
