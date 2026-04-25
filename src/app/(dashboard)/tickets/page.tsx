'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ticket, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useTickets, useResolveTicket } from '@/hooks/use-tickets';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusVariants: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-yellow-500/10 text-yellow-500',
  resolved: 'bg-green-500/10 text-green-500',
  closed: 'bg-gray-500/10 text-gray-500',
  reopened: 'bg-orange-500/10 text-orange-500',
};

const priorityVariants: Record<string, string> = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

export default function TicketsPage() {
  const { data: ticketsData, isLoading } = useTickets();
  const resolveTicket = useResolveTicket();

  const tickets = ticketsData?.data || [];

  const handleResolve = (id: string) => {
    resolveTicket.mutate(id, {
      onSuccess: () => toast.success('Ticket resolved'),
      onError: () => toast.error('Failed to resolve ticket'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and resolve support tickets.</p>
        </div>
        <Button>
          <Ticket className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium max-w-[250px] truncate">{ticket.title}</TableCell>
                    <TableCell className="capitalize">{ticket.category}</TableCell>
                    <TableCell>
                      <Badge className={priorityVariants[ticket.priority] || 'bg-gray-500/10 text-gray-500'}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusVariants[ticket.status] || 'bg-gray-500/10 text-gray-500'}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolve(ticket.id)}
                            disabled={resolveTicket.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
