'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Search, Plus, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';
import { PermissionGate } from '@/components/rbac/permission-gate';
import { Permissions } from '@/lib/rbac/permissions';

const employees = [
  { id: 1, name: 'John Doe', email: 'john@company.com', code: 'EMP001', department: 'Engineering', role: 'Senior Developer', status: 'active' },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', code: 'EMP002', department: 'Design', role: 'UI Designer', status: 'active' },
  { id: 3, name: 'Mike Johnson', email: 'mike@company.com', code: 'EMP003', department: 'Marketing', role: 'Marketing Manager', status: 'on_leave' },
  { id: 4, name: 'Sarah Williams', email: 'sarah@company.com', code: 'EMP004', department: 'Engineering', role: 'DevOps Engineer', status: 'active' },
  { id: 5, name: 'Tom Brown', email: 'tom@company.com', code: 'EMP005', department: 'Sales', role: 'Sales Representative', status: 'probation' },
];

const departments = [
  { name: 'Engineering', count: 45, color: 'bg-blue-500/10 text-blue-500' },
  { name: 'Design', count: 12, color: 'bg-purple-500/10 text-purple-500' },
  { name: 'Marketing', count: 18, color: 'bg-orange-500/10 text-orange-500' },
  { name: 'Sales', count: 23, color: 'bg-green-500/10 text-green-500' },
];

export default function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <DialogTrigger>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill in the employee details below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="john@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input placeholder="Engineering" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input placeholder="Developer" />
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Add Employee</Button>
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
        {departments.map((dept) => (
          <motion.div key={dept.name} variants={itemVariants}>
            <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{dept.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dept.count}</div>
                  <p className="text-xs text-muted-foreground">employees</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
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
              {filteredEmployees.map((employee) => (
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
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.code}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.role}</TableCell>
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
                      {employee.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
