'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

const defaultSettings = [
  { id: 'tasks', label: 'Task Assignments', description: 'When you are assigned a new task', enabled: true },
  { id: 'mentions', label: 'Mentions', description: 'When someone mentions you in a message', enabled: true },
  { id: 'projects', label: 'Project Updates', description: 'Updates on projects you are part of', enabled: true },
  { id: 'leaves', label: 'Leave Approvals', description: 'Status updates on your leave requests', enabled: true },
  { id: 'announcements', label: 'Announcements', description: 'Company-wide announcements', enabled: true },
];

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSave = () => {
    // TODO: Wire to notification preferences API when available
    toast.success('Notification preferences saved');
  };

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
          {settings.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={item.id}>{item.label}</Label>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <Switch 
                id={item.id} 
                checked={item.enabled}
                onCheckedChange={() => toggleSetting(item.id)}
              />
            </div>
          ))}
          <Button onClick={handleSave} className="mt-4">Save Preferences</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
