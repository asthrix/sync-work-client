'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pin, ThumbsUp, Eye } from 'lucide-react';
import { useAnnouncements, useAcknowledgeAnnouncement } from '@/hooks/use-communication';
import { toast } from 'sonner';

export default function AnnouncementsPage() {
  const { data, isLoading, error } = useAnnouncements();
  const acknowledge = useAcknowledgeAnnouncement();
  
  const announcements = data?.data || [];

  const handleAcknowledge = (id: string) => {
    acknowledge.mutate(id, {
      onSuccess: () => toast.success('Acknowledged'),
      onError: () => toast.error('Failed to acknowledge'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with company news.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Failed to load announcements. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No announcements yet.</p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement, index) => (
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
                          {announcement.is_pinned && <Pin className="h-4 w-4 text-primary" />}
                          <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          By {announcement.published_by} · {new Date(announcement.published_at).toLocaleDateString()}
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
                      {!announcement.is_acknowledged && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAcknowledge(announcement.id)}
                          disabled={acknowledge.isPending}
                        >
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Acknowledge
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Read
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
