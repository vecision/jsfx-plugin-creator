import { cookies } from 'next/headers';

import { ServerProviders } from '@jsfx-plugins-generator/components/providers';

import styles from './layout.module.scss';
import '../theme/global.scss';

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
      <html lang="en" className={styles[theme]}>
        <head>
          <title>Reaper jsfx Plugin Generator</title>
        </head>
        <body>
          <main>{children}</main>
        </body>
      </html>
    </ServerProviders>
  );
}
