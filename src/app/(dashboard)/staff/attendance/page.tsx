'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, LogIn, LogOut, CalendarDays } from 'lucide-react';
import { useAttendance, useMyAttendance, useCheckIn, useCheckOut } from '@/hooks/use-attendance';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('today');
  const { data: attendanceData, isLoading } = useAttendance();
  const { data: myAttendanceData } = useMyAttendance();
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const attendance = attendanceData?.data || [];
  const myAttendance = myAttendanceData?.data || [];

  const handleCheckIn = () => {
    checkIn.mutate(undefined, {
      onSuccess: () => toast.success('Checked in successfully'),
      onError: () => toast.error('Failed to check in'),
    });
  };

  const handleCheckOut = () => {
    checkOut.mutate(undefined, {
      onSuccess: () => toast.success('Checked out successfully'),
      onError: () => toast.error('Failed to check out'),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16" />
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
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">Track time and attendance records.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCheckIn} disabled={checkIn.isPending}>
            <LogIn className="mr-2 h-4 w-4" />
            Check In
          </Button>
          <Button variant="outline" onClick={handleCheckOut} disabled={checkOut.isPending}>
            <LogOut className="mr-2 h-4 w-4" />
            Check Out
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myAttendance[0]?.check_out ? 'Checked Out' : myAttendance[0]?.check_in ? 'Checked In' : 'Not Started'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check In</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myAttendance[0]?.check_in ? format(new Date(myAttendance[0].check_in), 'HH:mm') : '--:--'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check Out</CardTitle>
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myAttendance[0]?.check_out ? format(new Date(myAttendance[0].check_out), 'HH:mm') : '--:--'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="my">My History</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attendance.length === 0 ? (
                  <p className="text-muted-foreground">No attendance records for today.</p>
                ) : (
                  attendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.employee_id}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.check_in ? format(new Date(record.check_in), 'HH:mm') : '--:--'} -
                            {record.check_out ? format(new Date(record.check_out), 'HH:mm') : '--:--'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={record.status === 'present' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="my" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myAttendance.length === 0 ? (
                  <p className="text-muted-foreground">No attendance records found.</p>
                ) : (
                  myAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-4">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.check_in ? format(new Date(record.check_in), 'HH:mm') : '--:--'} -
                            {record.check_out ? format(new Date(record.check_out), 'HH:mm') : '--:--'}
                          </p>
                        </div>
                      </div>
                      <Badge variant={record.status === 'present' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
