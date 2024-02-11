import { useEffect, useLayoutEffect } from 'react';

import { isServer } from '../server';

/**
 * @see https://usehooks-ts.com/react-hook/use-isomorphic-layout-effect
 */
export const useIsomorphicLayoutEffect = isServer ? useEffect : useLayoutEffect;
