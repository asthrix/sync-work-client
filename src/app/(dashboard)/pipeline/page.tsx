'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, GripVertical } from 'lucide-react';

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500/10' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500/10' },
  { id: 'review', title: 'Review', color: 'bg-yellow-500/10' },
  { id: 'done', title: 'Done', color: 'bg-green-500/10' },
];

const initialTasks = [
  { id: 1, title: 'Design system components', column: 'todo', priority: 'high', assignee: 'JD' },
  { id: 2, title: 'API endpoint documentation', column: 'in_progress', priority: 'medium', assignee: 'MS' },
  { id: 3, title: 'User authentication flow', column: 'in_progress', priority: 'critical', assignee: 'SW' },
  { id: 4, title: 'Dashboard analytics', column: 'review', priority: 'high', assignee: 'JD' },
  { id: 5, title: 'Email notification service', column: 'done', priority: 'low', assignee: 'TB' },
  { id: 6, title: 'Mobile responsive design', column: 'todo', priority: 'medium', assignee: 'JS' },
];

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

export default function PipelinePage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState<number | null>(null);

  const handleDragStart = (taskId: number) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string) => {
    if (draggedTask) {
      setTasks(tasks.map(task =>
        task.id === draggedTask ? { ...task, column: columnId } : task
      ));
      setDraggedTask(null);
    }
  };

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column, columnIndex) => (
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
              <CardHeader className={`pb-3 ${column.color} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                  <Badge variant="secondary">
                    {tasks.filter(t => t.column === column.id).length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-3">
                {tasks
                  .filter((task) => task.column === column.id)
                  .map((task, taskIndex) => (
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
                              className={`text-xs ${priorityColors[task.priority]}`}
                            >
                              {task.priority}
                            </Badge>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {task.assignee}
                              </AvatarFallback>
                            </Avatar>
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
    </motion.div>
  );
}
