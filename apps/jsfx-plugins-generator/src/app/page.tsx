import { Metadata } from 'next';

import { ClientProviders } from '@jsfx-plugins-generator/components/providers';

import { SliderForm } from '@jsfx-plugins-generator/features/jsfx/plugin';

export const metadata: Metadata = {
  title: 'JSFX Plugin Generator for Reaper DAW (Cockos)',
  description:
    'This tool helps you generator JSFX plugins for Reaper DAW (Cockos)™. Create and adjust the sliders to your match your needs, and then download the plugin. Place the downloaded plugin in the Reaper source directory and then refresh the effects list.',
  keywords: [
    'jsfx',
    'no code',
    'reaper',
    'cockos',
    'daw',
    'plugin',
    'vst',
    'generator',
    'slider',
    'cc',
    'github',
    'open source',
    'free',
    'download',
    'presets',
    'midi',
  ],
};

export default function Page() {
  return (
    <div>
      <ClientProviders>
        <SliderForm />
      </ClientProviders>
    </div>
  );
}
