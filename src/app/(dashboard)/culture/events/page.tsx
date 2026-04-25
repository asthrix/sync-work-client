'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Trophy, Vote, Heart } from 'lucide-react';
import { useEvents, usePolls, useRecognitions, useRegisterForEvent, useVotePoll } from '@/hooks/use-culture';
import { toast } from 'sonner';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';

export default function CulturePage() {
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const { data: pollsData, isLoading: pollsLoading } = usePolls();
  const { data: recognitionsData, isLoading: recognitionsLoading } = useRecognitions();
  const registerForEvent = useRegisterForEvent();
  const votePoll = useVotePoll();

  const events = eventsData?.data || [];
  const polls = pollsData?.data || [];
  const recognitions = recognitionsData?.data || [];

  const handleRegister = (eventId: string) => {
    registerForEvent.mutate(eventId, {
      onSuccess: () => toast.success('Registered for event'),
      onError: () => toast.error('Failed to register'),
    });
  };

  const handleVote = (pollId: string, optionId: string) => {
    votePoll.mutate({ pollId, optionId }, {
      onSuccess: () => toast.success('Vote recorded'),
      onError: () => toast.error('Failed to vote'),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Culture & Events</h1>
        <p className="text-muted-foreground">Team events, polls, and recognitions.</p>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="polls">Polls</TabsTrigger>
          <TabsTrigger value="recognitions">Recognitions</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          {eventsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-full">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No events scheduled.</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {events.map((event) => (
                <motion.div key={event.id} variants={itemVariants}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge variant="outline">{event.type.replace('_', ' ')}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => handleRegister(event.id)}
                          disabled={registerForEvent.isPending}
                        >
                          Register
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
          {pollsLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : polls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Vote className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No active polls.</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4"
            >
              {polls.map((poll) => (
                <motion.div key={poll.id} variants={itemVariants}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{poll.title}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Vote className="h-4 w-4" />
                          {poll.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {poll.options?.map((option: any, index: number) => (
                        <Button
                          key={option.id || index}
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => option.id && handleVote(poll.id, option.id)}
                          disabled={votePoll.isPending || poll.status !== 'published'}
                        >
                          {option.text || option.label || `Option ${index + 1}`}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="recognitions" className="space-y-4">
          {recognitionsLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recognitions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No recognitions yet.</p>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4"
            >
              {recognitions.map((rec) => (
                <motion.div key={rec.id} variants={itemVariants}>
                  <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <Trophy className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{rec.from_user_id}</span>
                              <span className="text-muted-foreground">gave</span>
                              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                              <span className="text-muted-foreground">to</span>
                              <span className="font-medium">{rec.to_user_id}</span>
                            </div>
                            <p className="text-muted-foreground">{rec.message}</p>
                            <Badge variant="secondary">+{rec.points} points</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
