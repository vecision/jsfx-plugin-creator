import { useEffect, useRef, useState } from 'react';

export const useInterval = (interval = 2000) => {
  const [show, setShow] = useState(false);
  const intervalId = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalId.current = setInterval(() => {
      setShow(prev => !prev);
    }, interval);

    return () => clearInterval(intervalId.current);
  }, [interval]);

  return [show, intervalId.current];
};
