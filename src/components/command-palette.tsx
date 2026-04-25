'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Command as CommandPrimitive } from 'cmdk';
import { useUIStore } from '@/lib/stores/ui-store';
import { usePermissions } from '@/hooks/use-permissions';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  DollarSign,
  MessageSquare,
  Calendar,
  Shield,
  Settings,
  Search,
  FileText,
  BarChart3,
  Bell,
  Hash,
  Trophy,
  ClipboardList,
  CreditCard,
  PiggyBank,
} from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

export function CommandPalette() {
  const router = useRouter();
  const open = useUIStore((state) => state.commandMenuOpen);
  const setOpen = useUIStore((state) => state.setCommandMenuOpen);
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState('');

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  const navigateTo = (path: string) => {
    router.push(path);
    setOpen(false);
    setSearch('');
  };

  const allCommands: CommandItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => navigateTo('/'),
      keywords: ['home', 'main', 'overview'],
    },
    {
      id: 'staff',
      name: 'Staff & HR',
      icon: <Users className="h-4 w-4" />,
      action: () => navigateTo('/staff'),
      keywords: ['employees', 'team', 'people', 'hr'],
    },
    {
      id: 'projects',
      name: 'Projects',
      icon: <FolderKanban className="h-4 w-4" />,
      action: () => navigateTo('/projects'),
      keywords: ['tasks', 'work', 'kanban'],
    },
    {
      id: 'pipeline',
      name: 'Pipeline',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigateTo('/pipeline'),
      keywords: ['board', 'kanban', 'workflow'],
    },
    {
      id: 'clients',
      name: 'Clients',
      icon: <Building2 className="h-4 w-4" />,
      action: () => navigateTo('/clients'),
      keywords: ['customers', 'crm', 'contacts'],
    },
    {
      id: 'finance-payroll',
      name: 'Finance - Payroll',
      icon: <DollarSign className="h-4 w-4" />,
      action: () => navigateTo('/finance/payroll'),
      keywords: ['salary', 'payment', 'wages'],
    },
    {
      id: 'finance-expenses',
      name: 'Finance - Expenses',
      icon: <CreditCard className="h-4 w-4" />,
      action: () => navigateTo('/finance/expenses'),
      keywords: ['costs', 'spending', 'bills'],
    },
    {
      id: 'finance-budgets',
      name: 'Finance - Budgets',
      icon: <PiggyBank className="h-4 w-4" />,
      action: () => navigateTo('/finance/budgets'),
      keywords: ['budget', 'planning', 'forecast'],
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => navigateTo('/communication/chat'),
      keywords: ['messages', 'conversation', 'talk'],
    },
    {
      id: 'announcements',
      name: 'Announcements',
      icon: <Bell className="h-4 w-4" />,
      action: () => navigateTo('/communication/announcements'),
      keywords: ['news', 'updates', 'notices'],
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      action: () => navigateTo('/communication/notifications'),
      keywords: ['alerts', 'reminders'],
    },
    {
      id: 'events',
      name: 'Events',
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigateTo('/culture/events'),
      keywords: ['calendar', 'meetings', 'activities'],
    },
    {
      id: 'audit',
      name: 'Audit Log',
      icon: <Shield className="h-4 w-4" />,
      action: () => navigateTo('/audit'),
      keywords: ['logs', 'history', 'compliance', 'activity'],
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigateTo('/settings/profile'),
      keywords: ['preferences', 'config', 'profile'],
    },
  ];

  // Filter commands based on permissions
  const commands = allCommands.filter((cmd) => {
    switch (cmd.id) {
      case 'staff': return hasPermission('staff:view');
      case 'projects': return hasPermission('project:view');
      case 'pipeline': return hasPermission('pipeline:view');
      case 'clients': return hasPermission('client:view');
      case 'finance-payroll':
      case 'finance-expenses':
      case 'finance-budgets': return hasPermission('finance:view');
      case 'chat': return hasPermission('chat:view');
      case 'announcements': return hasPermission('announcement:view');
      case 'events': return hasPermission('event:view');
      case 'audit': return hasPermission('audit:view');
      case 'settings': return hasPermission('settings:view');
      default: return true;
    }
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Command Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
          >
            <CommandPrimitive
              className="overflow-hidden rounded-xl border bg-popover shadow-2xl"
              loop
            >
              <div className="flex items-center border-b px-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <CommandPrimitive.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="flex h-12 w-full rounded-md bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <kbd className="hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium sm:flex">
                  ESC
                </kbd>
              </div>

              <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </CommandPrimitive.Empty>

                <CommandPrimitive.Group heading="Navigation">
                  {commands.map((command) => (
                    <CommandPrimitive.Item
                      key={command.id}
                      value={`${command.name} ${command.keywords?.join(' ') || ''}`}
                      onSelect={command.action}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                        'aria-selected:bg-accent aria-selected:text-accent-foreground'
                      )}
                    >
                      <span className="text-muted-foreground">{command.icon}</span>
                      <span className="flex-1">{command.name}</span>
                      {command.shortcut && (
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                          {command.shortcut}
                        </kbd>
                      )}
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.Group>
              </CommandPrimitive.List>

              <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Navigate with</span>
                  <kbd className="rounded border bg-muted px-1 py-0.5">↑↓</kbd>
                </div>
                <div className="flex items-center gap-2">
                  <span>Select with</span>
                  <kbd className="rounded border bg-muted px-1 py-0.5">↵</kbd>
                </div>
              </div>
            </CommandPrimitive>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
