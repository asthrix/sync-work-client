import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CommandPalette } from '@/components/command-palette';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      <CommandPalette />
      <div className="flex flex-col">
        <TopBar />
        <main className="flex-1 p-6 pt-20 md:pt-6 transition-all duration-300 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
