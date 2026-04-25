'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUIStore } from '@/lib/stores/ui-store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  MessageSquare,
  Calendar,
  Shield,
  Settings,
  DollarSign,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Staff & HR', href: '/staff', icon: Users },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Finance', href: '/finance/payroll', icon: DollarSign },
  { name: 'Communication', href: '/communication/chat', icon: MessageSquare },
  { name: 'Culture', href: '/culture/events', icon: Calendar },
  { name: 'Audit', href: '/audit', icon: Shield },
];

export function MobileNav() {
  const mobileMenuOpen = useUIStore((state) => state.mobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);

  return (
    <>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <motion.div
        initial={false}
        animate={mobileMenuOpen ? { x: 0 } : { x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r md:hidden'
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold">
            <span className="text-primary">Sync</span>Work
          </span>
        </div>
        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
}
