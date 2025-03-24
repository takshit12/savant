'use client';

import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Savant Tools</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Savant Tools. All rights reserved.
        </div>
      </footer>
    </div>
  );
} 