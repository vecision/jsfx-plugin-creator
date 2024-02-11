const isServer = typeof window === 'undefined';

/**
 * A simple wrapper around the `localStorage` and `sessionStorage` APIs
 *
 * @returns An object with `get`, `set` and `remove` methods and the `key` used for storage
 *
 * @client-only
 *
 * @example Basic usage
 * const localePersisted = persist('locale.persisted');
 *
 * localePersisted.set('da-DK');
 * localePersisted.get(); // 'da-DK'
 *
 * localePersisted.set({ locale: 'da-DK' });
 * localePersisted.get(); // { locale: 'da-DK' }
 *
 * localePersisted.remove();
 * localePersisted.get(); // undefined
 *
 * @example Different storage types
 * const localePersisted = persist('locale.persisted');
 * // Or
 * const localePersisted = persist.session('locale.persisted');
 * // Or
 * const localePersisted = persist.local('locale.persisted');
 */
export const persist = <T extends string | boolean | object>(
  /**
   * The key to use for the storage
   * If `undefined`, the value will not be persisted, but the if any data is stored under the key, it will not be removed
   */
  key: string | undefined,
  /**
   * The storage type to use
   * @default localStorage
   */
  storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
) => {
  const storage = !isServer ? (storageType === 'sessionStorage' ? sessionStorage : localStorage) : undefined;

  /**
   * @returns The value parsed from storage
   *
   * - If the value is an `object` or `array`, it will be parsed as `JSON`
   * - If the value is a `boolean`, it will be parsed as a `boolean`
   * - If the value is a `number`, it will return as a `string`
   * - If the value is a `string`, it will be returned as a `string`
   */
  const get = <ReturnType extends Extract<T, string | boolean | object>>(): ReturnType | undefined => {
    if (!storage || !key) return;

    const persistedValue = storage.getItem(key) || '';

    if (persistedValue === '') {
      return;
    }

    // If the value is a boolean, return it as a boolean
    if (persistedValue === 'true' || persistedValue === 'false') {
      return (persistedValue === 'true') as ReturnType;
    }

    try {
      const parsed = JSON.parse(persistedValue) as ReturnType;

      return parsed as ReturnType;
    } catch (error) {
      return persistedValue as ReturnType;
    }
  };

  /**
   * Remove the value from storage
   */
  const remove = (): void => {
    if (!storage || !key) return;

    storage.removeItem(key);
  };

  /**
   * @param value The value to set
   * If the value is `null`, the value will be removed from storage
   */
  const set = (value: T | undefined): void => {
    if (!storage || !key) return;

    if (value === undefined) {
      return;
    }

    if (value === null) {
      remove();
      return;
    }

    if (typeof value === 'object') {
      storage.setItem(key, JSON.stringify(value));
      return;
    }

    if (typeof value === 'boolean') {
      storage.setItem(key, value.toString());
      return;
    }

    storage.setItem(key, value);
  };

  return {
    key,
    get,
    set,
    remove,
  };
};

type PersistParams = Parameters<typeof persist>;

persist.session = <T extends string | boolean | object>(key?: PersistParams[0]) => persist<T>(key, 'sessionStorage');

persist.local = <T extends string | boolean | object>(key?: PersistParams[0]) => persist<T>(key, 'localStorage');
