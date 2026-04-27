'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, Plus, Mail, Phone, MoreHorizontal, AlertCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';
import { PermissionGate } from '@/components/rbac/permission-gate';
import { Permissions } from '@/lib/rbac/permissions';
import { useEmployees, useDepartments, useCreateEmployee, useDeleteEmployee } from '@/hooks/use-staff';
import { useUsers } from '@/hooks/use-users';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, EmployeeFormData } from '@/lib/validations/forms';
import { Label } from '@/components/ui/label';

function EmployeeSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
    </TableRow>
  );
}

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useEmployees({
    search: searchQuery,
    limit: 50,
  });
  
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments();
  const { data: usersData } = useUsers({ limit: 1000 });
  const createEmployee = useCreateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const employees = employeesData?.data || [];
  const departments = departmentsData?.data || [];
  const users = usersData?.data || [];

  // Create lookup maps
  const usersById = useMemo(() => {
    const map = new Map();
    users.forEach((user: any) => map.set(user.id, user));
    return map;
  }, [users]);

  const departmentsById = useMemo(() => {
    const map = new Map();
    departments.forEach((dept: any) => map.set(dept.id, dept));
    return map;
  }, [departments]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      console.log('Creating employee with data:', data);
      const result = await createEmployee.mutateAsync(data as any);
      console.log('Employee created successfully:', result);
      toast.success('Employee created successfully');
      reset();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to create employee';
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (employeeId: string) => {
    setDeleteEmployeeId(employeeId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteEmployeeId) return;
    
    try {
      await deleteEmployee.mutateAsync(deleteEmployeeId);
      toast.success('Employee deleted successfully');
      setIsDeleteDialogOpen(false);
      setDeleteEmployeeId(null);
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete employee';
      toast.error(errorMessage);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteEmployeeId(null);
  };

  if (employeesError) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load employees</h2>
          <p className="text-muted-foreground">{employeesError.message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Staff & HR</h1>
          <p className="text-muted-foreground">Manage your team members and departments.</p>
        </div>
        <PermissionGate permission={Permissions.STAFF_CREATE}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            } />
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill in the employee details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input id="first_name" {...register('first_name')} placeholder="John" />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input id="last_name" {...register('last_name')} placeholder="Doe" />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} placeholder="john@company.com" />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input id="password" type="password" {...register('password')} placeholder="Min 6 characters" />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_code">Employee Code *</Label>
                  <Input id="employee_code" {...register('employee_code')} placeholder="EMP001" />
                  {errors.employee_code && (
                    <p className="text-sm text-destructive">{errors.employee_code.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employment_type">Employment Type *</Label>
                  <select id="employment_type" {...register('employment_type')} className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="">Select type...</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  {errors.employment_type && (
                    <p className="text-sm text-destructive">{errors.employment_type.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date *</Label>
                  <Input id="hire_date" type="date" {...register('hire_date')} />
                  {errors.hire_date && (
                    <p className="text-sm text-destructive">{errors.hire_date.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title *</Label>
                  <Input id="job_title" {...register('job_title')} placeholder="Developer" />
                  {errors.job_title && (
                    <p className="text-sm text-destructive">{errors.job_title.message}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department_id">Department</Label>
                  <select id="department_id" {...register('department_id')} className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="">Select department...</option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <p className="text-sm text-destructive">{errors.department_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input id="salary" type="number" {...register('salary', { valueAsNumber: true })} placeholder="50000" />
                  {errors.salary && (
                    <p className="text-sm text-destructive">{errors.salary.message}</p>
                  )}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={createEmployee.isPending}
              >
                {createEmployee.isPending ? 'Creating...' : 'Add Employee'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </PermissionGate>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {departmentsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          departments.map((dept: any) => {
            const deptEmployeeCount = employees.filter((emp: any) => emp.department_id === dept.id).length;
            return (
              <motion.div key={dept.id} variants={itemVariants}>
                <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{dept.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{deptEmployeeCount}</div>
                      <p className="text-xs text-muted-foreground">employees</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Employees</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <EmployeeSkeleton key={i} />
                ))
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee: any) => {
                  const user = usersById.get(employee.user_id);
                  const department = employee.department_id ? departmentsById.get(employee.department_id) : null;
                  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown';
                  const initials = fullName !== 'Unknown' ? fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : 'U';
                  
                  return (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className="border-b transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{fullName}</p>
                            <p className="text-sm text-muted-foreground">{user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.employee_id || employee.employee_code || 'N/A'}</TableCell>
                      <TableCell>{department?.name || 'N/A'}</TableCell>
                      <TableCell>{employee.job_title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={employee.status === 'active' ? 'default' : 'secondary'}
                          className={
                            employee.status === 'on_leave'
                              ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                              : employee.status === 'probation'
                              ? 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
                              : ''
                          }
                        >
                          {employee.status?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => window.location.href = `/staff/${employee.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <PermissionGate permission={Permissions.STAFF_UPDATE}>
                              <DropdownMenuItem onClick={() => window.location.href = `/staff/${employee.id}?edit=true`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission={Permissions.STAFF_DELETE}>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteClick(employee.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEmployee.isPending}
            >
              {deleteEmployee.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
