import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Expression 3D Engine',
  description: '3D Infix, Postfix, and Prefix Expression Visualizer',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-[#08080a] text-zinc-100 antialiased selection:bg-zinc-100 selection:text-zinc-950">
        {children}
      </body>
    </html>
  );
}
