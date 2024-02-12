import React, { ReactNode } from 'react';

import { ToastProvider } from '@jsfx-plugins-generator/components/toast/toast';

export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
};
