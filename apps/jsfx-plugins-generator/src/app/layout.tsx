import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import classNames from 'classnames';
import { Noto_Sans, Noto_Sans_Mono } from 'next/font/google';
import { cookies } from 'next/headers';

import { ServerProviders } from '@jsfx-plugins-generator/components/providers';

import styles from './layout.module.scss';
import '../theme/global.scss';

const NotoSansMono = Noto_Sans_Mono({
  subsets: ['latin'],
  display: 'swap',
});
const NotoSans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const defaultTheme = 'dark';
  const cookieValue = cookies().get('theme')?.value || '';
  const isTheme = cookieValue === defaultTheme || cookieValue === 'dark';
  const theme = isTheme ? cookieValue : defaultTheme;

  return (
    <ServerProviders>
      <html
        lang="en"
        className={classNames(styles[theme])}
        style={
          {
            '--font-family-noto-sans-mono': NotoSansMono.style.fontFamily,
            '--font-family-noto-sans': NotoSans.style.fontFamily,
          } as React.CSSProperties
        }
      >
        <head>
          <title>Reaper jsfx Plugin Generator</title>
        </head>
        <body>
          <main>{children}</main>
          <GoogleAnalytics gaId="G-2WRDHYCVCQ" />
          <Analytics />
        </body>
      </html>
    </ServerProviders>
  );
}
