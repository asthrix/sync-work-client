'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FolderKanban,
  Users,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { staggerContainer, itemVariants, pageTransition } from '@/lib/animations/variants';
import { useProjects } from '@/hooks/use-projects';
import { useEmployees } from '@/hooks/use-staff';
import { useClients } from '@/hooks/use-clients';
import { useEvents } from '@/hooks/use-culture';
import { useAnnouncements } from '@/hooks/use-communication';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

function StatCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ limit: 4 });
  const { data: employeesData, isLoading: employeesLoading } = useEmployees({ limit: 1 });
  const { data: clientsData, isLoading: clientsLoading } = useClients({ limit: 1 });
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const { data: announcementsData } = useAnnouncements();

  const projects = projectsData?.data || [];
  const employeesCount = employeesData?.pagination?.total || 0;
  const clientsCount = clientsData?.pagination?.total || 0;
  const eventsCount = eventsData?.data?.length || 0;
  const announcements = announcementsData?.data || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const stats = [
    {
      title: 'Total Projects',
      value: projectsLoading ? '...' : String(projectsData?.pagination?.total || 0),
      icon: FolderKanban,
      color: 'bg-blue-500/10 text-blue-500',
      loading: projectsLoading,
    },
    {
      title: 'Team Members',
      value: employeesLoading ? '...' : String(employeesCount),
      icon: Users,
      color: 'bg-green-500/10 text-green-500',
      loading: employeesLoading,
    },
    {
      title: 'Active Clients',
      value: clientsLoading ? '...' : String(clientsCount),
      icon: Building2,
      color: 'bg-purple-500/10 text-purple-500',
      loading: clientsLoading,
    },
    {
      title: 'Upcoming Events',
      value: eventsLoading ? '...' : String(eventsCount),
      icon: Calendar,
      color: 'bg-orange-500/10 text-orange-500',
      loading: eventsLoading,
    },
  ];

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
          {getGreeting()}, {user?.first_name || 'Welcome back'}! 👋
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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={itemVariants}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full"
              >
                {stat.loading ? (
                  <StatCardSkeleton />
                ) : (
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
                        <span className="text-green-500">↑ Active</span>
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>

      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Recent Projects</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          {projectsLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-2 w-full" />
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-7 w-7 rounded-full border-2" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No projects yet. Create your first project to get started.
              </CardContent>
            </Card>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-4 md:grid-cols-2"
            >
              {projects.slice(0, 4).map((project: any) => (
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
                            <span className="font-medium">{project.progress || 0}%</span>
                          </div>
                          <Progress value={project.progress || 0} className="h-2" />
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
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No announcements yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 5).map((announcement: any) => (
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
                          <p className="text-sm text-muted-foreground">
                            {announcement.published_at ? new Date(announcement.published_at).toLocaleDateString() : 'Recently'}
                          </p>
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
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
