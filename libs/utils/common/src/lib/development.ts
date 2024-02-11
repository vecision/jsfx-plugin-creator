const isDevelopment = process.env.NODE_ENV === 'development';

const log = (
  title: string | undefined,
  properties?: Record<string | number | symbol, unknown> | undefined | null,
  { collapsed = true, trace = true }: { collapsed?: boolean; trace?: boolean } = {}
) => {
  if (!isDevelopment && process.env.VERBOSE !== 'true') return;

  if (collapsed) {
    console.groupCollapsed(title);
  } else {
    console.group(title);
  }

  if (properties && typeof properties === 'object') {
    const newProperties = { ...properties };

    console.table(newProperties);
  }

  if (trace) {
    console.trace();
  }

  console.groupEnd();
};

export const DEV = {
  log,
};
