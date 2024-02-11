import { useState } from 'react';

/**
 * A hook to trigger a rerender
 * Useful in situations where you're mutating a value that's not in state
 */
export const useRerender = () => {
  const [_, triggerRerender] = useState(false);

  return () => triggerRerender(prev => !prev);
};
