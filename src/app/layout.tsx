import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Savant Tools UI',
  description: 'A platform for accessing multiple AI tools and agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <main className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
} 