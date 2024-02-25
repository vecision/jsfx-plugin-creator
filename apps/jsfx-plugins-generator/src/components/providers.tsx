import Script from 'next/script';
import React, { ReactNode } from 'react';

import { ToastProvider } from '@jsfx-plugins-generator/components/toast/toast';

export const ServerProviders = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <HotjarTracking />
      {children}
    </>
  );
};

export const ClientProviders = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <ToastProvider />
    </>
  );
};

const HotjarTracking = () => {
  return (
    <Script id="hotjar">
      {`(function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:1050672,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
    </Script>
  );
};
