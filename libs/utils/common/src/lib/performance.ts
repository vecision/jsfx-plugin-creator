/**
 * This converts an object or array into a primitive key.
 * This is useful for React hooks when you need a primitive key for the dependency array.
 *
 * We're using `JSON.stringify` to convert the object into a string.
 * This means that an reordering of the object or array will result in a different key.
 *
 * NOTE: Only do performance optimization when needed.
 *
 * @example
 * ```tsx
  const Component = () => {
    const key = useMemoKey(['a', 'b', 'c']); // <- This returns `["a","b","c"]`

    useEffect(() => {
      // Here is some heavy operation which should only execute when the `key` updates.
    }, [key])
  }
 * ```
 */
export const toMemoKey = <T>(values: T) => JSON.stringify(values);
