'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pin, ThumbsUp, Eye } from 'lucide-react';

const announcements = [
  { id: 1, title: 'New Design System Rollout', content: 'We are excited to announce the launch of our new design system. All teams should start migrating by Q2.', priority: 'high', date: '2 hours ago', pinned: true, author: 'Jane Smith' },
  { id: 2, title: 'Team Building Event Next Friday', content: 'Join us for a fun-filled day of activities and team bonding. Food and drinks will be provided!', priority: 'normal', date: '1 day ago', pinned: false, author: 'HR Team' },
  { id: 3, title: 'Q4 Goals Review Meeting', content: 'All department heads are required to attend the Q4 review meeting on Monday at 10 AM.', priority: 'urgent', date: '2 days ago', pinned: true, author: 'Mike Johnson' },
];

export default function AnnouncementsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with company news.</p>
        </div>
        <Button>New Announcement</Button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {announcement.pinned && <Pin className="h-4 w-4 text-primary" />}
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {announcement.author} · {announcement.date}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        announcement.priority === 'urgent'
                          ? 'bg-red-500/10 text-red-500'
                          : announcement.priority === 'high'
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }
                    >
                      {announcement.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{announcement.content}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Acknowledge
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      Read
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
