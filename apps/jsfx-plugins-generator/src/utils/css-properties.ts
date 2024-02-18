import { CSSProperties } from 'react';

export const toCSSProperties = (properties: CSSProperties, scope = '_'): CSSProperties => {
  const newProperties: CSSProperties = {};
  for (const key in properties) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (properties as any)[key];
    const prefix = '--' + scope;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newProperties as any)[prefix + key] = value;
  }

  return newProperties;
};
