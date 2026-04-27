'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Pencil, Trash2, Save, X } from 'lucide-react';
import { useEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/use-staff';
import { toast } from 'sonner';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const employeeUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  job_title: z.string().min(1, 'Job title is required'),
});

type EmployeeUpdateForm = z.infer<typeof employeeUpdateSchema>;

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, error } = useEmployee(id);
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const employee = data?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeUpdateForm>({
    resolver: zodResolver(employeeUpdateSchema),
    values: employee ? {
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      job_title: employee.job_title || '',
    } : undefined,
  });

  const onSubmit = async (formData: EmployeeUpdateForm) => {
    try {
      await updateEmployee.mutateAsync({ id, data: formData });
      toast.success('Employee updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update employee');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee.mutateAsync(id);
      toast.success('Employee deleted successfully');
      router.push('/staff');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete employee');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-9 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load employee</h2>
          <Link href="/staff" className={buttonVariants({ variant: 'default' })}>Back to Staff</Link>
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
        <Link href="/staff" className={buttonVariants({ variant: 'ghost' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Staff
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
              <Button onClick={handleSubmit(onSubmit)} disabled={updateEmployee.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {employee.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{employee.full_name}</CardTitle>
              <p className="text-sm text-muted-foreground">{employee.job_title}</p>
              <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" {...register('first_name')} />
                  {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" {...register('last_name')} />
                  {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input id="job_title" {...register('job_title')} />
                {errors.job_title && <p className="text-sm text-destructive">{errors.job_title.message}</p>}
              </div>
            </form>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Employee Code</p>
                <p className="font-medium">{employee.employee_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{employee.department?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hire Date</p>
                <p className="font-medium">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
