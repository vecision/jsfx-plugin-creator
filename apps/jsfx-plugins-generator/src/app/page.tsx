import { GoogleAnalytics } from '@next/third-parties/google';

import { ClientProviders } from '@jsfx-plugins-generator/components/providers';

import { SliderForm } from '@jsfx-plugins-generator/features/jsfx/plugin';

export default function Page() {
  return (
    <div>
      <GoogleAnalytics gaId="G-2WRDHYCVCQ" />
      <ClientProviders>
        <SliderForm />
      </ClientProviders>
    </div>
  );
}
