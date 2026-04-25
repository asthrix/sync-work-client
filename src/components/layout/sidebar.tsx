'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
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
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  Ticket,
  Clock,
  Plane,
  TrendingUp,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Staff & HR', href: '/staff', icon: Users },
  { name: 'Attendance', href: '/staff/attendance', icon: Clock },
  { name: 'Leave', href: '/staff/leaves', icon: Calendar },
  { name: 'Performance', href: '/staff/performance', icon: TrendingUp },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Pipeline', href: '/pipeline', icon: BarChart3 },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Tickets', href: '/tickets', icon: Ticket },
  { name: 'Finance', href: '/finance/payroll', icon: DollarSign },
  { name: 'Salary', href: '/finance/salary-structures', icon: DollarSign },
  { name: 'Communication', href: '/communication/chat', icon: MessageSquare },
  { name: 'Culture', href: '/culture/events', icon: Calendar },
  { name: 'Trips', href: '/culture/trips', icon: Plane },
  { name: 'Audit', href: '/audit', icon: Shield, adminOnly: true },
];

const bottomNavigation = [
  { name: 'Settings', href: '/settings/profile', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebarCollapse = useUIStore((state) => state.toggleSidebarCollapse);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');

  const visibleNav = navigation.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return true;
  });

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
          >
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </motion.div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold whitespace-nowrap"
            >
              <span className="text-primary">Sync</span>Work
            </motion.span>
          )}
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebarCollapse}
          className="rounded-md p-1.5 hover:bg-accent"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </motion.button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleNav.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                </motion.div>
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap">{item.name}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t p-3 space-y-1">
        {bottomNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {!sidebarCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}
