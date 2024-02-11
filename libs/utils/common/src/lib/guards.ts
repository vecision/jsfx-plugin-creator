import React from 'react';

/**
 * `isType` is a method to force cast `T` to another type,
 * and adding a `safetyCheck` to runtime validate that the cast is correct.
 */
export const isType = <T>(
  /**
   * The value that you want to check
   */
  value: unknown,
  /**
   * The check that the value actually is of that type
   */
  safetyCheck: ((v: T) => boolean) | boolean
): value is T => {
  // If the safety check is a function.
  if (typeof safetyCheck === 'function') {
    return !!value && safetyCheck(value as T);
  }

  // If the safety check is a boolean
  return !!value && safetyCheck;
};

/**
 * A guard to check if the value is a `ReactNode`.
 *
 * @see {@link React.ReactNode}
 *
 * @WARNING - While this is helpful for typing, it's unsafe and can give unpredictable results.
 */
export const isReactNode = (value: unknown, includePrimitives = true): value is React.ReactNode => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((value as any)?.['$$typeof'] === Symbol.for('react.element')) {
    return true;
  }

  if (
    includePrimitives &&
    (typeof value === 'string' || typeof value === 'number' || value === null || value === true || value === false)
  ) {
    return true;
  }

  return false;
};

export const isNil = <T>(value: T | undefined | null): value is undefined | null => {
  if (value === null || value === undefined) {
    return true;
  }

  return false;
};
