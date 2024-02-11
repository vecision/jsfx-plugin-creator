/**
 * Generate an array from a number
 * @returns Array with `quantity` amount of items in it, with their index as value.
 */
export const arrayFromNumber = (quantity: number) => Array.from(Array(quantity).keys());

/**
 * Check whether an array is empty
 * @returns `true` - if the array is empty
 */
export const isEmpty = <T>(array: T[] | undefined): boolean => !array || array?.length === 0;

/**
 * Check whether an array is not empty
 * @returns `true` - if the array is not empty
 */
export const isNotEmpty = <T>(array: T[] | undefined | null): array is T[] => !!array && array.length > 0;

/**
 * @returns The first item from the array or the item
 */
export const first = <T>(array: T | T[] | undefined): T | undefined => {
  if (array && Array.isArray(array)) {
    return array[0];
  }

  return array as T;
};
