
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { FloatingAssistant } from '@/components/ai/DigitalAssistant';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      <FloatingAssistant />
    </div>
  );
}
