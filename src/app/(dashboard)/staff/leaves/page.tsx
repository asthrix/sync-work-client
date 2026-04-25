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
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useLeaves, useApproveLeave, useRejectLeave, useLeaveBalance } from '@/hooks/use-leaves';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusVariants: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  approved: 'bg-green-500/10 text-green-500',
  rejected: 'bg-red-500/10 text-red-500',
};

export default function LeavesPage() {
  const { data: leavesData, isLoading } = useLeaves();
  const { data: balanceData } = useLeaveBalance();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const leaves = leavesData?.data || [];
  const balance = balanceData?.data || {};

  const handleApprove = (id: string) => {
    approveLeave.mutate(id, {
      onSuccess: () => toast.success('Leave approved'),
      onError: () => toast.error('Failed to approve leave'),
    });
  };

  const handleReject = (id: string) => {
    rejectLeave.mutate({ id, reason: 'Rejected by manager' }, {
      onSuccess: () => toast.success('Leave rejected'),
      onError: () => toast.error('Failed to reject leave'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-40" />
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
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground">Manage and approve leave requests.</p>
        </div>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(balance).map(([type, days]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{type.replace('_', ' ')}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{days} days</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No leave requests found.
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium capitalize">{leave.type}</TableCell>
                    <TableCell>
                      {format(new Date(leave.start_date), 'MMM dd')} -
                      {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{leave.reason || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusVariants[leave.status] || 'bg-gray-500/10 text-gray-500'}>
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {leave.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(leave.id)}
                            disabled={approveLeave.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(leave.id)}
                            disabled={rejectLeave.isPending}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
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
