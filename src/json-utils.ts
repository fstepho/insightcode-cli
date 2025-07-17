/**
 * JSON replacer function to filter out absolutePath from output
 * and format numeric values
 */
export function createJsonReplacer(filterAbsolutePath: boolean = true) {
  return function(key: string, val: unknown): unknown {
    // Filter out absolutePath from output if requested
    if (filterAbsolutePath && key === 'absolutePath') return undefined;
    
    // Format numeric values with fixed decimals
    if (val && typeof val === 'number' && !Number.isInteger(val)) {
      return Number(val.toFixed(2));
    }
    return val;
  };
}

/**
 * Default JSON replacer that filters absolutePath and formats numbers
 */
export const defaultJsonReplacer = createJsonReplacer(true);