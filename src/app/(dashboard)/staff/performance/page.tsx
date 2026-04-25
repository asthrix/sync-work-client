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
import { Star, TrendingUp } from 'lucide-react';
import { usePerformanceReviews } from '@/hooks/use-performance';
import { format } from 'date-fns';

const statusVariants: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-500',
  submitted: 'bg-blue-500/10 text-blue-500',
  reviewed: 'bg-green-500/10 text-green-500',
  acknowledged: 'bg-purple-500/10 text-purple-500',
};

export default function PerformancePage() {
  const { data: reviewsData, isLoading } = usePerformanceReviews();

  const reviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
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
          <h1 className="text-3xl font-bold tracking-tight">Performance Reviews</h1>
          <p className="text-muted-foreground">Track employee performance and reviews.</p>
        </div>
        <Button>
          <TrendingUp className="mr-2 h-4 w-4" />
          New Review
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Goals</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No performance reviews found.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.period}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{review.rating || '-'}/5</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusVariants[review.status] || 'bg-gray-500/10 text-gray-500'}>
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{review.goals?.length || 0} goals</TableCell>
                    <TableCell>
                      {review.submitted_at ? format(new Date(review.submitted_at), 'MMM dd, yyyy') : '-'}
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
