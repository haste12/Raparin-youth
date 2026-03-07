import './globals.css';
import { LanguageProvider } from './LanguageContext';

export const metadata = {
  title: 'Raparin Youth Organization | ڕێکخراوی گەنجانی ڕاپەڕین',
  description: 'Raparin Youth Organization - Empowering young leaders in the Raparin region of Kurdistan since 2022. ڕێکخراوی گەنجانی ڕاپەڕین',
  keywords: 'Raparin, Youth, Organization, Kurdistan, Iraq, گەنجان, ڕاپەڕین',
  openGraph: {
    title: 'Raparin Youth Organization',
    description: 'Empowering youth in Raparin, Kurdistan since 2022',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#33AAFF" />
        {/* Anti-flash: set theme BEFORE first paint */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('raparin-theme')||'light';document.documentElement.setAttribute('data-theme',t);})()` }} />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
