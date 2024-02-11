import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * ## Use Delayed useState
 *
 * Sometimes you need to show a loading state for a component after the "loading" state is set to true.
 * This hook will help you to do that, adding a delay either before or after the loading state is set to true.
 *
 * @example
 * ```tsx
  const Component = () => {
    const [submitting, setSubmitting] = useDelayedState(false);

    useEffect(() => {
      if (x === y) {
        setSubmitting(true, 500); // <- This will set the state to the passed parameter after 500ms
      }
    }, [x, y])
  }
 * ```
 */
export const useDelayedState = <T>(
  defaultValue: T
): [T, (state: T, timeout?: number | undefined, onDone?: () => void) => void] => {
  const timeoutInRef = useRef<number>();
  const [state, setState] = useState(defaultValue);

  /**
   * Delayed useState
   */
  const setDelayedState = useCallback((state: T, timeout?: number, onDone?: () => void) => {
    if (timeout) {
      timeoutInRef.current = window.setTimeout(() => {
        setState(state);
        onDone?.();
      }, timeout);
      return;
    }

    setState(state);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutInRef.current);
    };
  }, []);

  return [state, setDelayedState];
};
