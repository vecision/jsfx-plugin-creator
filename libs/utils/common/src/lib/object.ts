/**
 * Object Values
 * The Object.values provides the correct type, so we just have this function for consistency for the `keys` and `entries` functions.
 */
export const values = Object.values as <T extends object>(o: T) => T[keyof T][];

/**
 * Object Keys
 * The Object.keys method doesn't provide the correct type for the key, hence the creation of this function.
 */
export const keys = Object.keys as <T extends object>(o: T) => (keyof T)[];

/**
 * Object Entries
 * The Object.entries method doesn't provide the correct type for the key, hence the creation of this function.
 */
export const entries = Object.entries as <T extends object>(o: T) => [keyof T, T[keyof T]][];

export const hasOwn = <T extends object>(value: T | undefined, key: keyof T): value is T => {
  if (!value) {
    return false;
  }

  return Object.hasOwn(value, key);
};

/**
 * Remove all properties from an Object which values are `Nil`
 */
export const prune = <T extends object>(
  /** The Object you want to remove a key from */
  obj: T | undefined
) => {
  if (!obj) return;

  // Create an new object, so we keep the original as is
  const newObj = { ...obj };
  // Get the Keys from the Object
  const _keys = keys(obj);

  // Iterate over each of the Keys and remove the properties
  _keys.forEach(k => {
    // If the property value isn't `undefined` or `null`, then do not delete it
    if (newObj[k] !== undefined && newObj[k] !== null) {
      return;
    }

    // Delete the key from the object
    delete newObj[k];
  });

  return newObj;
};
