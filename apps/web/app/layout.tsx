import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/app/provider';
import {
  HydrationBoundary,
  dehydrate,
  QueryClient,
} from '@tanstack/react-query';
import { getMe } from '@/shared/api/auth';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mini Pay',
  description: 'Mini Pay',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
  });
  const dehydratedState = dehydrate(queryClient);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <HydrationBoundary state={dehydratedState}>
            {children}
          </HydrationBoundary>
        </AppProvider>
      </body>
    </html>
  );
}
