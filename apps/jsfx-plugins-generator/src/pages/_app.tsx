import { AppProps } from 'next/app';
import Head from 'next/head';
import './global.scss';
import { SliderForm } from 'apps/jsfx-plugins-generator/src/jsfx/plugin';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Welcome to jsfx-plugin-creator!</title>
      </Head>
      <main className="app">
        <SliderForm />
      </main>
    </>
  );
}

export default CustomApp;
