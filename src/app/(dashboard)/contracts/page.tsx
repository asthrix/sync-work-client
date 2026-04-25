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
import { FileText, RefreshCw, XCircle } from 'lucide-react';
import { useContracts, useRenewContract, useTerminateContract } from '@/hooks/use-contracts';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusVariants: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-500',
  active: 'bg-green-500/10 text-green-500',
  expired: 'bg-yellow-500/10 text-yellow-500',
  terminated: 'bg-red-500/10 text-red-500',
  renewed: 'bg-blue-500/10 text-blue-500',
};

export default function ContractsPage() {
  const { data: contractsData, isLoading } = useContracts();
  const renewContract = useRenewContract();
  const terminateContract = useTerminateContract();

  const contracts = contractsData?.data || [];

  const handleRenew = (id: string) => {
    renewContract.mutate(id, {
      onSuccess: () => toast.success('Contract renewed'),
      onError: () => toast.error('Failed to renew contract'),
    });
  };

  const handleTerminate = (id: string) => {
    terminateContract.mutate(id, {
      onSuccess: () => toast.success('Contract terminated'),
      onError: () => toast.error('Failed to terminate contract'),
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
                  <Skeleton className="h-4 w-32" />
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
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <p className="text-muted-foreground">Manage client contracts and agreements.</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          New Contract
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.title}</TableCell>
                    <TableCell>
                      {contract.value ? `${contract.currency} ${contract.value.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(contract.start_date), 'MMM dd, yyyy')} -
                      {contract.end_date ? format(new Date(contract.end_date), 'MMM dd, yyyy') : 'Ongoing'}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusVariants[contract.status] || 'bg-gray-500/10 text-gray-500'}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {contract.status === 'active' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRenew(contract.id)}
                              disabled={renewContract.isPending}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTerminate(contract.id)}
                              disabled={terminateContract.isPending}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
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
