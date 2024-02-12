import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { Providers } from '@jsfx-plugins-generator/components/providers';

import './global.scss';

const SliderForm = dynamic(() => import('@jsfx-plugins-generator/features/jsfx/plugin').then(mod => mod.SliderForm), {
  ssr: false,
  loading: () => <p>Loading...</p>,
});

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Head>
        <title>Welcome to jsfx-plugin-creator!</title>
      </Head>
      <main className="app">
        <SliderForm />
      </main>
    </Providers>
  );
}

export default CustomApp;
