import { useEffect, useState } from 'react';

/**
 * Hook to preserve a `string` after it's `undefined`.
 *
 * This is useful if you want to animate a `string` while it's unmounting.
 * If the `string` immediately changes to `undefined`, the animation will not work.
 *
 * @example
 * ```tsx
  const Component = ({ text }: { text: string }) => {
    const preservedText = usePreserveString(text); // <-- this is the important part

    return (
      <AnimatePresence>
        <div className={styles.wrapper}> // Apply some styling to me while I'm unmounting, and the text won't disappear
          <p>{preservedText}</p>
        </div>
      </AnimatePresence>
      )
  }
 * ```
 */
export const usePreserveString = (
  text: string | undefined,
  {
    delay = 1000,
  }: {
    delay?: number;
  } = {}
) => {
  const [preserveText, setPreserveText] = useState(text);

  useEffect(() => {
    if (text) {
      if (preserveText === text) return;

      setPreserveText(text);
    }

    const timeout = window.setTimeout(() => setPreserveText(undefined), delay);

    return () => window.clearTimeout(timeout);
  }, [text, delay, preserveText]);

  return preserveText;
};
