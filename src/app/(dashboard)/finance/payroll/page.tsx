'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Download, CheckCircle } from 'lucide-react';

const payrollData = [
  { id: 1, employee: 'John Doe', salary: 85000, bonus: 5000, deductions: 12000, netPay: 78000, status: 'processed' },
  { id: 2, employee: 'Jane Smith', salary: 92000, bonus: 7500, deductions: 13500, netPay: 86000, status: 'processed' },
  { id: 3, employee: 'Mike Johnson', salary: 78000, bonus: 3000, deductions: 10500, netPay: 70500, status: 'pending' },
  { id: 4, employee: 'Sarah Williams', salary: 95000, bonus: 8000, deductions: 14200, netPay: 88800, status: 'processed' },
];

export default function PayrollPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">Manage employee salaries and payments.</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>January 2025 Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.employee}</TableCell>
                  <TableCell>${row.salary.toLocaleString()}</TableCell>
                  <TableCell>${row.bonus.toLocaleString()}</TableCell>
                  <TableCell>${row.deductions.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">${row.netPay.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={row.status === 'processed' ? 'default' : 'secondary'}
                      className={row.status === 'processed' ? 'bg-green-500/10 text-green-500' : ''}
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
