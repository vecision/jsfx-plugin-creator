import classNames from 'classnames';
import { HTMLAttributes, useEffect, useState } from 'react';

import styles from './splash.module.scss';

export const Splash = ({
  show,
  className,
  children,
  delay = 0,
  ...rest
}: { show?: boolean; delay?: number } & HTMLAttributes<HTMLDivElement>) => {
  const [hideSplash, setHideSplash] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      // If we're still showing the Splash, then force close it
      if (show) return;
      setHideSplash(true);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [show]);

  useEffect(() => {
    if (!show) {
      const timeout = setTimeout(() => {
        setHideSplash(true);
      }, delay);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [delay, show]);

  return (
    <div {...rest} hidden={hideSplash} className={classNames(styles.splash, className, {})}>
      <p className={styles.text}>{children}</p>
    </div>
  );
};
