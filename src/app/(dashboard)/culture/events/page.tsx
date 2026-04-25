'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Users, Trophy, Vote, Heart } from 'lucide-react';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';

const events = [
  { id: 1, title: 'Team Building Workshop', date: '2025-02-15', location: 'Conference Room A', attendees: 25, maxAttendees: 30, type: 'team_building' },
  { id: 2, title: 'Hackathon 2025', date: '2025-03-01', location: 'Main Hall', attendees: 45, maxAttendees: 50, type: 'hackathon' },
  { id: 3, title: 'Game Night', date: '2025-02-28', location: 'Lounge', attendees: 15, maxAttendees: 20, type: 'game_night' },
];

const polls = [
  { id: 1, title: 'New office location preference', votes: 89, totalVotes: 120, options: ['Downtown', 'Suburbs', 'Remote'] },
  { id: 2, title: 'Team lunch day', votes: 45, totalVotes: 60, options: ['Monday', 'Wednesday', 'Friday'] },
];

const recognitions = [
  { id: 1, from: 'John Doe', to: 'Jane Smith', message: 'Amazing work on the new design system!', points: 100, type: 'kudos' },
  { id: 2, from: 'Mike Johnson', to: 'Sarah Williams', message: 'Outstanding performance this quarter!', points: 250, type: 'award' },
];

export default function CulturePage() {
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
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {event.attendees} / {event.maxAttendees} attendees
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Spots filled</span>
                          <span className="font-medium">{Math.round((event.attendees / event.maxAttendees) * 100)}%</span>
                        </div>
                        <Progress value={(event.attendees / event.maxAttendees) * 100} className="h-2" />
                      </div>
                      <Button className="w-full">Register</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="polls" className="space-y-4">
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
                        {poll.votes} / {poll.totalVotes}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {poll.options.map((option, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{option}</span>
                          <span className="text-muted-foreground">{Math.round(Math.random() * 40 + 20)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(Math.random() * 40 + 20)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full rounded-full bg-primary"
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">Vote Now</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="recognitions" className="space-y-4">
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
                            <span className="font-medium">{rec.from}</span>
                            <span className="text-muted-foreground">gave</span>
                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            <span className="text-muted-foreground">to</span>
                            <span className="font-medium">{rec.to}</span>
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
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
