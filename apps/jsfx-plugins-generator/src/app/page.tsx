import { Metadata } from 'next';

import { ClientProviders } from '@jsfx-plugins-generator/components/providers';

import { SliderForm } from '@jsfx-plugins-generator/features/jsfx/plugin';

export const metadata: Metadata = {
  title: 'JSFX Plugin Generator for Reaper DAW (Cockos)',
  description:
    'A tool to generate a JSFX plugins for Reaper DAW. Create and adjust sliders to your match your needs and download the plugin',
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
