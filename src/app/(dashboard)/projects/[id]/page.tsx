'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Pencil, Trash2, Save, X } from 'lucide-react';
import { useProject, useUpdateProject, useDeleteProject } from '@/hooks/use-projects';
import { toast } from 'sonner';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']),
});

type ProjectUpdateForm = z.infer<typeof projectUpdateSchema>;

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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, error } = useProject(id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const project = data?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectUpdateForm>({
    resolver: zodResolver(projectUpdateSchema),
    values: project ? {
      name: project.name,
      description: project.description || '',
      priority: project.priority,
      status: project.status,
    } : undefined,
  });

  const onSubmit = async (formData: ProjectUpdateForm) => {
    try {
      await updateProject.mutateAsync({ id, data: formData });
      toast.success('Project updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update project');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject.mutateAsync(id);
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-9 w-48" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load project</h2>
          <Link href="/projects" className={buttonVariants({ variant: 'default' })}>Back to Projects</Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl"
    >
      <div className="flex items-center justify-between">
        <Link href="/projects" className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={updateProject.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project.name}</CardTitle>
            <div className="flex gap-2">
              <Badge className={statusColors[project.status]}>{project.status?.replace('_', ' ')}</Badge>
              <Badge variant="outline" className={priorityColors[project.priority]}>{project.priority}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea id="description" {...register('description')} className="w-full rounded-md border border-input bg-background px-3 py-2" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select id="priority" {...register('priority')} className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" {...register('status')} className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">{project.description || 'No description'}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium">{project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
