import { RefObject } from 'react';

import { isNotEmpty } from '../array';
import { useEventListener } from './use-event-listeners';

type Handler = (event: MouseEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | null,
  handler: Handler,
  {
    mouseEvent = 'mousedown',
    excludeRefs,
  }: {
    mouseEvent?: 'mousedown' | 'mouseup';
    excludeRefs?: RefObject<HTMLElement>[];
  } = {}
): void {
  useEventListener(mouseEvent, event => {
    if (!ref) return;

    const el = ref?.current;

    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains(event.target as Node)) {
      return;
    }

    if (isNotEmpty(excludeRefs)) {
      const isExclude = excludeRefs.some(excludeRef => {
        const excludeEl = excludeRef?.current;

        if (!excludeEl) return false;

        return excludeEl.contains(event.target as Node);
      });

      if (isExclude) return;
    }

    handler(event);
  });
}
