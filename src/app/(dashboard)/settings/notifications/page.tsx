'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, Mail, MessageSquare } from 'lucide-react';

export default function NotificationSettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-2xl"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Manage your notification preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: 'tasks', label: 'Task Assignments', description: 'When you are assigned a new task' },
            { id: 'mentions', label: 'Mentions', description: 'When someone mentions you in a message' },
            { id: 'projects', label: 'Project Updates', description: 'Updates on projects you are part of' },
            { id: 'leaves', label: 'Leave Approvals', description: 'Status updates on your leave requests' },
            { id: 'announcements', label: 'Announcements', description: 'Company-wide announcements' },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={item.id}>{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch id={item.id} defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
