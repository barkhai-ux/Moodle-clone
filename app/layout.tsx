import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from '@/components/ui/toaster';
import { StudentShell } from '@/components/layout/StudentShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduPortal - Learning Management System',
  description: 'A comprehensive learning management system for teachers and students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <NotificationProvider>
                <div className="pt-16">
                  <StudentShell>
                    {children}
                  </StudentShell>
                </div>
                <Toaster />
              </NotificationProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}