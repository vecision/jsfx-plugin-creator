import { NextRouter, useRouter } from 'next/dist/client/router';
import { ParsedUrlQuery } from 'querystring';
import { useEffect } from 'react';

import { prune } from '../object';
import { isServer } from '../server';

/**
 * ## Use Route Query useState
 *
 * ```tsx
  const Component = () => {
    const [{ area }, setArea] = useQueryState<{ area: Area }>();

    useEffect(() => {
      if (x === y) {
        setArea('AB'); // <- This will be pushed to the Route Query
      }
    }, [x, y])
  }
 * ```
 */
export const useQueryState = <Queries extends ParsedUrlQuery = ParsedUrlQuery>(
  initialState?: Partial<Queries>,
  config?: Parameters<typeof useSetQueryState>[1]
): [Partial<Queries>, (newQuery: Partial<Queries> | ((prevQuery: Partial<Queries>) => Partial<Queries>)) => void] => {
  const query = useQueryValue<Partial<Queries>>();
  const setState = useSetQueryState<Partial<Queries>>(initialState as Partial<Queries>, config);

  return [query, setState];
};

/**
 * ## Use Set Route Query useState
 *
 * @example
 * ```tsx
  const Component = () => {
    const setArea = useSetQueryState<{ area: Area }>();

    useEffect(() => {
      if (x === y) {
        setArea('AB'); // <- This will be pushed to the Route Query
      }
    }, [x, y])
  }
 * ```
 */
export const useSetQueryState = <Queries extends ParsedUrlQuery = ParsedUrlQuery>(
  initialState?: Partial<Queries>,
  {
    type = 'push',
    ...config
  }: {
    type?: 'push' | 'replace';
  } & Parameters<NextRouter['push']>[2] = {}
): ((newQuery: Partial<Queries> | ((prevQuery: Partial<Queries>) => Partial<Queries>)) => void) => {
  const { asPath, push, replace, pathname } = useRouter() || {};
  const query = useQueryValue<Partial<Queries>>();

  const setState = (newQuery: Partial<Queries> | ((prevQuery: Partial<Queries>) => Partial<Queries>)) => {
    if (isServer) return;
    const newQueryState = typeof newQuery === 'function' ? newQuery(query) : newQuery;

    const queries = prune({
      ...query,
      ...newQueryState,
    });

    if (!queries) return;

    const asPathWithoutQuery = asPath.split('?')[0];

    const queriesAsString = Object.keys(queries).length
      ? `?${new URLSearchParams(queries as Record<string, string>).toString()}`
      : '';

    const newAsPath = asPathWithoutQuery + queriesAsString;

    if (type === 'push') {
      push(pathname, newAsPath, {
        shallow: true,
        ...config,
      });
    }

    if (type === 'replace') {
      replace(pathname, newAsPath, {
        shallow: true,
        ...config,
      });
    }
  };

  useEffect(() => {
    if (isServer || !initialState) return;

    const queries = prune({
      ...query,
      ...initialState,
    });

    if (!queries) return;

    const asPathWithoutQuery = asPath.split('?')[0];

    const queriesAsString = Object.keys(queries).length
      ? `?${new URLSearchParams(queries as Record<string, string>).toString()}`
      : '';

    const newAsPath = asPathWithoutQuery + queriesAsString;

    replace(pathname, newAsPath, { shallow: true, ...config });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return setState;
};

/**
 * ## Use Route Query useState
 *
 * @example
 * ```tsx
  const Component = () => {
    const { area } = useQueryValue<{ area: Area }>();

    useEffect(() => {
      console.log(area); // <- This will be the current value of the Route Query
    }, [x, y])
  }
 * ```
 */
export const useQueryValue = <Queries extends ParsedUrlQuery = ParsedUrlQuery>(): Partial<Queries> => {
  const { asPath } = useRouter() || {};
  const query = getAsPathQueries(asPath);

  return query as Partial<Queries>;
};

/**
 * Get the query from the asPath
 */
export const getAsPathQueries = <Queries extends ParsedUrlQuery = ParsedUrlQuery>(asPath: string): Partial<Queries> => {
  const query = asPath.split('?')[1] ? Object.fromEntries(new URLSearchParams(asPath.split('?')[1])) : {};

  for (const key in query) {
    const value = query[key];

    if (Array.isArray(value)) {
      query[key] = value[value.length - 1];
    }
  }

  return query as Partial<Queries>;
};
