import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/theme-provider';
<<<<<<< HEAD
import { MaintenanceGuard } from '@/components/maintenance-guard';
=======
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QR Menu - Restaurant Ordering System',
  description: 'Modern QR-based restaurant ordering system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <MaintenanceGuard>
            {children}
          </MaintenanceGuard>
=======
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          {children}
>>>>>>> 8927fdd41df3b5b094ff22db87ad20aeb3d376c2
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </body>
    </html>
  );
}
