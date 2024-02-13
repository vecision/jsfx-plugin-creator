import React, { ReactNode } from 'react';

import { ToastProvider } from '@jsfx-plugins-generator/components/toast/toast';

export const ServerProviders = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const ClientProviders = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
};
