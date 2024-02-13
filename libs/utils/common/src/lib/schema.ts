import { z } from 'zod';

export const getMinMaxAttributesFromChecks = (checks: z.ZodNumberCheck[]) => {
  return Object.fromEntries(
    checks.map(check => {
      const key = check.kind;

      if (check.kind === 'max') {
        return [key, check.value];
      }

      if (check.kind === 'min') {
        return [key, check.value];
      }

      if (check.kind === 'multipleOf') {
        return [key, check.value];
      }

      return [key, check];
    })
  );
};
