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
import { Plane, MapPin, Users, Calendar } from 'lucide-react';
import { useTrips, useRegisterForTrip } from '@/hooks/use-culture';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusVariants: Record<string, string> = {
  planning: 'bg-gray-500/10 text-gray-500',
  open: 'bg-green-500/10 text-green-500',
  closed: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-blue-500/10 text-blue-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

export default function TripsPage() {
  const { data: tripsData, isLoading } = useTrips();
  const registerForTrip = useRegisterForTrip();

  const trips = tripsData?.data || [];

  const handleRegister = (id: string) => {
    registerForTrip.mutate(id, {
      onSuccess: () => toast.success('Registered for trip'),
      onError: () => toast.error('Failed to register'),
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-4 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Company Trips</h1>
          <p className="text-muted-foreground">Upcoming trips and team outings.</p>
        </div>
        <Button>
          <Plane className="mr-2 h-4 w-4" />
          Plan Trip
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {trips.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No trips planned yet.
            </CardContent>
          </Card>
        ) : (
          trips.map((trip) => (
            <Card key={trip.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{trip.destination}</CardTitle>
                  <Badge className={statusVariants[trip.status] || 'bg-gray-500/10 text-gray-500'}>
                    {trip.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {trip.destination}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(trip.start_date), 'MMM dd')} -
                  {format(new Date(trip.end_date), 'MMM dd, yyyy')}
                </div>
                {trip.max_participants && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Max {trip.max_participants} participants
                  </div>
                )}
                {trip.cost_per_person && (
                  <div className="text-sm font-medium">
                    Cost: ${trip.cost_per_person} per person
                  </div>
                )}
                {trip.status === 'open' && (
                  <Button
                    className="w-full mt-2"
                    onClick={() => handleRegister(trip.id)}
                    disabled={registerForTrip.isPending}
                  >
                    Register
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );
}
