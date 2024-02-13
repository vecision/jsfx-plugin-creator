import { ClientProviders } from '@jsfx-plugins-generator/components/providers';

import { SliderForm } from '@jsfx-plugins-generator/features/jsfx/plugin';

export default function Page() {
  return (
    <div>
      <ClientProviders>
        <SliderForm />
      </ClientProviders>
    </div>
  );
}
