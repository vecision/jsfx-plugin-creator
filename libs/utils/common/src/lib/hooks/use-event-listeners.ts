import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import { DependencyList, useEffect } from 'react';

type EventListenerCallback<K extends keyof WindowEventMap> = (ev: WindowEventMap[K]) => void;

/**
 * A wrapper for the EventListener
 */
export const useKeyPressEffect = (
  /**
   * The Target Key or `debug` which will output in the console the triggered event.
   */
  targetKey: string | 'debug',
  /**
   * The callback to be executed when the targetKey is pressed
   */
  callback: Parameters<typeof useEventListener>[1],
  /**
   * Dependencies for the callback
   * If you want the effect to be re-run when the dependencies change,
   */
  config?: Parameters<typeof useEventListener>[2]
) => {
  const handleCallback: EventListenerCallback<'keydown'> = e => {
    if (targetKey === 'debug') {
      console.log('Key:', e.key, e);
    }

    if (e.key === targetKey) {
      callback?.(e);
    }
  };

  useEventListener('keydown', handleCallback, config);
};

/**
 * A wrapper for the EventListener
 */
export const useEventListener = <K extends keyof WindowEventMap>(
  /**
   * The Event Listener type
   */
  type: K,
  /**
   * The callback to be executed when the type is triggered
   */
  callback: ((ev: WindowEventMap[K]) => void) | undefined,
  /**
   * Configuration for the Event Listener
   */
  config: {
    /**
     * Dependencies for the callback
     * If you want the effect to be re-run when the dependencies change,
     */
    deps?: DependencyList | never[] | undefined;
    debounce?: number;
    throttle?: number;
  } = {}
) => {
  /**
   * The event listener do no matter what require a callback, so we're giving it one,
   * event if the callback is undefined. This makes it possible to disable the event listener temporarily.
   */
  const handleCallback: EventListenerCallback<K> = e => callback?.(e);

  /**
   * We then create a listener based on the configuration and the callback
   * This makes it possible to pass the event listener a throttled or debounced callback
   */
  const listener = config?.debounce
    ? debounce(handleCallback, config.debounce)
    : config?.throttle
    ? throttle(handleCallback, config.throttle)
    : handleCallback;

  useEffect(() => {
    // Add the event listener
    window.addEventListener(type, listener);

    // If no callback exists, then just remove the event listener again.
    if (!callback) {
      window.removeEventListener(type, listener);
    }

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener(type, listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, config?.deps || []); // Empty array ensures that effect is only run on mount and unmount
};
