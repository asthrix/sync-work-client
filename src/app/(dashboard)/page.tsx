'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  FolderKanban,
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { staggerContainer, itemVariants, pageTransition } from '@/lib/animations/variants';
import { cn } from '@/lib/utils';
const stats = [
  {
    title: 'Total Projects',
    value: '24',
    icon: FolderKanban,
    trend: '+12%',
    trendUp: true,
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    title: 'Team Members',
    value: '156',
    icon: Users,
    trend: '+5%',
    trendUp: true,
    color: 'bg-green-500/10 text-green-500',
  },
  {
    title: 'Active Clients',
    value: '38',
    icon: Building2,
    trend: '+8%',
    trendUp: true,
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    title: 'Upcoming Events',
    value: '7',
    icon: Calendar,
    trend: '+2',
    trendUp: true,
    color: 'bg-orange-500/10 text-orange-500',
  },
];

const recentProjects = [
  { id: 1, name: 'Website Redesign', progress: 75, status: 'active', priority: 'high' },
  { id: 2, name: 'Mobile App v2.0', progress: 45, status: 'active', priority: 'critical' },
  { id: 3, name: 'API Integration', progress: 90, status: 'review', priority: 'medium' },
  { id: 4, name: 'Database Migration', progress: 30, status: 'planning', priority: 'high' },
];

const myTasks = [
  { id: 1, title: 'Review pull requests', status: 'todo', priority: 'high', due: 'Today' },
  { id: 2, title: 'Update documentation', status: 'in_progress', priority: 'medium', due: 'Tomorrow' },
  { id: 3, title: 'Fix navigation bug', status: 'done', priority: 'critical', due: 'Yesterday' },
  { id: 4, title: 'Design system update', status: 'todo', priority: 'low', due: 'Next week' },
];

const announcements = [
  { id: 1, title: 'New design system rollout', priority: 'high', date: '2 hours ago' },
  { id: 2, title: 'Team building event next Friday', priority: 'normal', date: '1 day ago' },
  { id: 3, title: 'Q4 goals review meeting', priority: 'urgent', date: '2 days ago' },
];

export default function DashboardPage() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <div className="flex flex-col gap-2">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold tracking-tight"
        >
          {getGreeting()}, Welcome back! 👋
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Here&apos;s what&apos;s happening in your workspace today.
        </motion.p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full"
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <div className={cn('rounded-md p-2', stat.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.trendUp ? 'text-green-500' : 'text-red-500'}>
                        {stat.trendUp ? '↑' : '↓'} {stat.trend}
                      </span>{' '}
                      from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2"
          >
            {recentProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Card className="cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        <Badge variant={project.priority === 'critical' ? 'destructive' : 'secondary'}>
                          {project.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <Avatar key={i} className="h-7 w-7 border-2 border-background">
                              <AvatarFallback className="text-xs">U{i}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">+2 more</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : task.status === 'in_progress' ? (
                        <Clock className="h-5 w-5 text-blue-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className={cn('font-medium', task.status === 'done' && 'line-through text-muted-foreground')}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">Due {task.due}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{task.priority}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <motion.div
                key={announcement.id}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <p className="text-sm text-muted-foreground">{announcement.date}</p>
                      </div>
                      <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {announcement.priority}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
