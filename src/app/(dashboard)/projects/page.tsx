'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Calendar, Users, TrendingUp, Filter, AlertCircle } from 'lucide-react';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';
import { PermissionGate } from '@/components/rbac/permission-gate';
import { Permissions } from '@/lib/rbac/permissions';
import { useProjects, useCreateProject } from '@/hooks/use-projects';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const projects = [
  { id: 1, name: 'Website Redesign', description: 'Complete overhaul of company website with modern design', status: 'active', priority: 'high', progress: 75, members: 5, dueDate: '2025-03-15' },
  { id: 2, name: 'Mobile App v2.0', description: 'Next generation mobile application with new features', status: 'active', priority: 'critical', progress: 45, members: 8, dueDate: '2025-04-30' },
  { id: 3, name: 'API Integration', description: 'Third-party API integrations for payment processing', status: 'review', priority: 'medium', progress: 90, members: 3, dueDate: '2025-02-28' },
  { id: 4, name: 'Database Migration', description: 'Migrate from legacy database to cloud solution', status: 'planning', priority: 'high', progress: 30, members: 4, dueDate: '2025-05-15' },
  { id: 5, name: 'AI Chatbot', description: 'Customer support chatbot with NLP capabilities', status: 'active', priority: 'medium', progress: 60, members: 6, dueDate: '2025-04-01' },
  { id: 6, name: 'Security Audit', description: 'Comprehensive security audit and fixes', status: 'on_hold', priority: 'critical', progress: 20, members: 2, dueDate: '2025-03-30' },
];

const statusColors: Record<string, string> = {
  planning: 'bg-blue-500/10 text-blue-500',
  active: 'bg-green-500/10 text-green-500',
  review: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-gray-500/10 text-gray-500',
  on_hold: 'bg-red-500/10 text-red-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: projectsData, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  
  const projects = projectsData?.data || [];

  const handleCreateProject = async (formData: FormData) => {
    try {
      await createProject.mutateAsync({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'critical',
        due_date: formData.get('due_date') as string,
        status: 'planning',
      } as any);
      toast.success('Project created successfully');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create project');
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load projects</h2>
          <p className="text-muted-foreground">{error.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track your projects.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <PermissionGate permission={Permissions.PROJECT_CREATE}>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Set up a new project for your team.</DialogDescription>
              </DialogHeader>
              <form action={handleCreateProject} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project Name</label>
                  <Input name="name" placeholder="Enter project name" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea name="description" className="w-full rounded-md border border-input bg-background px-3 py-2" rows={3} placeholder="Project description" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select name="priority" className="w-full rounded-md border border-input bg-background px-3 py-2" required>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Due Date</label>
                    <input name="due_date" type="date" className="w-full rounded-md border border-input bg-background px-3 py-2" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createProject.isPending}>
                  {createProject.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </PermissionGate>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-5 w-20 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No projects found
          </div>
        ) : (
          projects.map((project: any) => (
            <motion.div key={project.id} variants={itemVariants}>
              <Link href={`/projects/${project.id}`}>
                <motion.div
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <Badge className={statusColors[project.status] || statusColors.active}>
                          {project.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Badge variant="outline" className={priorityColors[project.priority] || priorityColors.medium}>
                        {project.priority}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{project.progress || 0}%</span>
                        </div>
                        <Progress value={project.progress || 0} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'No date'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {project.member_count || 0} members
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}
