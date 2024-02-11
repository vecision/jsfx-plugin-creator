import { useEffect, useState } from 'react';

/**
 * @returns `true` when the component has been mounted.
 *
 * Useful when you need to do JSX conditions that should only apply Client Side.
 */
export const useIsMounted = (onMounted?: () => void) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return onMounted?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mounted;
};
