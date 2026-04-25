'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, GripVertical } from 'lucide-react';
import { usePipelines, useStages, useMoveTask } from '@/hooks/use-pipeline';
import { toast } from 'sonner';

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

export default function PipelinePage() {
  const { data: pipelinesData, isLoading: pipelinesLoading } = usePipelines();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>('');
  const { data: stagesData, isLoading: stagesLoading } = useStages(selectedPipelineId);
  const moveTask = useMoveTask();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const pipelines = pipelinesData?.data || [];
  const stages = stagesData?.data || [];

  // Auto-select first pipeline
  useState(() => {
    if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  });

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetStageId: string) => {
    if (draggedTask && selectedPipelineId) {
      // Find current stage of dragged task
      const sourceStage = stages.find((s) => s.tasks?.some((t: any) => t.id === draggedTask));
      if (sourceStage) {
        moveTask.mutate(
          {
            pipelineId: selectedPipelineId,
            data: {
              task_id: draggedTask,
              source_stage_id: sourceStage.id,
              target_stage_id: targetStageId,
              position: 0,
            },
          },
          {
            onSuccess: () => toast.success('Task moved'),
            onError: () => toast.error('Failed to move task'),
          }
        );
      }
      setDraggedTask(null);
    }
  };

  if (pipelinesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex-shrink-0 w-80">
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
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
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">Drag and drop tasks to manage your workflow.</p>
        </div>
        <div className="flex gap-2">
          {pipelines.length > 1 && (
            <select
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {stagesLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="flex-shrink-0 w-80">
              <CardHeader>
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No pipelines found. Create a pipeline to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((column, columnIndex) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: columnIndex * 0.1 }}
              className="flex-shrink-0 w-80"
            >
              <Card
                className="h-full"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                <CardHeader className="pb-3 bg-secondary/50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{column.name}</CardTitle>
                    <Badge variant="secondary">
                      {column.tasks?.length || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-3">
                  {column.tasks?.map((task: any, taskIndex: number) => (
                    <motion.div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: taskIndex * 0.05 }}
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      className="cursor-move rounded-lg border bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <p className="text-sm font-medium">{task.title}</p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`text-xs ${priorityColors[task.priority] || priorityColors.medium}`}
                            >
                              {task.priority}
                            </Badge>
                            {task.assignee && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {task.assignee.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'UN'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
