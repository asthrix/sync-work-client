'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNotificationsWebSocket } from '@/hooks/use-notifications-websocket';
import { toast } from 'sonner';

const initialNotifications = [
  { id: '1', title: 'New task assigned', message: 'You have been assigned to "API Integration"', type: 'task', read: false, time: '5 min ago' },
  { id: '2', title: 'Leave approved', message: 'Your leave request for Feb 15-17 has been approved', type: 'leave', read: false, time: '1 hour ago' },
  { id: '3', title: 'Project update', message: 'Website Redesign is now 75% complete', type: 'project', read: true, time: '3 hours ago' },
  { id: '4', title: 'Meeting reminder', message: 'Team standup in 15 minutes', type: 'meeting', read: true, time: 'Yesterday' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const { onNotification } = useNotificationsWebSocket();

  // Subscribe to real-time notifications
  useEffect(() => {
    const unsub = onNotification((notification) => {
      const newNotif = {
        id: notification.id || String(Date.now()),
        title: notification.title || 'New Notification',
        message: notification.content || '',
        type: notification.type || 'info',
        read: false,
        time: 'Just now',
      };
      
      setNotifications((prev) => [newNotif, ...prev]);
      toast.info(notification.title, {
        description: notification.content,
      });
    });

    return () => unsub();
  }, [onNotification]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications.</p>
        </div>
        <Button variant="outline" onClick={markAllAsRead}>
          <Check className="mr-2 h-4 w-4" />
          Mark all as read
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors ${
                  !notification.read ? 'bg-primary/5' : ''
                }`}
              >
                <div className="mt-1">
                  <Bell className={`h-5 w-5 ${!notification.read ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && <Badge variant="default" className="h-2 w-2 rounded-full p-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
                <div className="flex gap-1">
                  {!notification.read && (
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(notification.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteNotification(notification.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
