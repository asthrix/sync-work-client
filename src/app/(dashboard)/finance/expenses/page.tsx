'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';

const expenses = [
  { id: 1, employee: 'John Doe', category: 'Travel', amount: 450.00, date: '2025-01-20', status: 'approved' },
  { id: 2, employee: 'Jane Smith', category: 'Office Supplies', amount: 125.50, date: '2025-01-19', status: 'pending' },
  { id: 3, employee: 'Mike Johnson', category: 'Software', amount: 299.00, date: '2025-01-18', status: 'approved' },
  { id: 4, employee: 'Sarah Williams', category: 'Training', amount: 850.00, date: '2025-01-17', status: 'rejected' },
];

const budgets = [
  { id: 1, name: 'Q1 Marketing', total: 50000, spent: 32500, remaining: 17500 },
  { id: 2, name: 'Engineering Tools', total: 25000, spent: 18000, remaining: 7000 },
  { id: 3, name: 'Office Renovation', total: 100000, spent: 45000, remaining: 55000 },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [searchQuery, setSearchQuery] = useState('');

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
          <p className="text-muted-foreground">Manage expenses, budgets, and payroll.</p>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-3"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <div className="flex items-center text-xs text-green-500">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12% from last month
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${approvedExpenses.toFixed(2)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {expenses.filter(e => e.status === 'approved').length} expenses
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">${pendingExpenses.toFixed(2)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {expenses.filter(e => e.status === 'pending').length} expenses
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="flex gap-2">
        <Button
          variant={activeTab === 'expenses' ? 'default' : 'outline'}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </Button>
        <Button
          variant={activeTab === 'budgets' ? 'default' : 'outline'}
          onClick={() => setActiveTab('budgets')}
        >
          Budgets
        </Button>
      </div>

      {activeTab === 'expenses' ? (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Expenses</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
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
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.employee}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="font-medium">${expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          expense.status === 'approved'
                            ? 'bg-green-500/10 text-green-500'
                            : expense.status === 'pending'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }
                      >
                        {expense.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid gap-4"
        >
          {budgets.map((budget) => (
            <motion.div key={budget.id} variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{budget.name}</CardTitle>
                    <Badge variant="outline">
                      {((budget.spent / budget.total) * 100).toFixed(0)}% used
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">${budget.spent.toLocaleString()} / ${budget.total.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(budget.spent / budget.total) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Remaining: ${budget.remaining.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
