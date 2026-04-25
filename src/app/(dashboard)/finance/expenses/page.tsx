'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';
import { useExpenses, useBudgets } from '@/hooks/use-finance';

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: expensesData, isLoading: expensesLoading } = useExpenses();
  const { data: budgetsData, isLoading: budgetsLoading } = useBudgets();

  const expenses = expensesData?.data || [];
  const budgets = budgetsData?.data || [];

  const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
  const approvedExpenses = expenses
    .filter((e: any) => e.status === 'approved')
    .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
  const pendingExpenses = expenses
    .filter((e: any) => e.status === 'pending')
    .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);

  const filteredExpenses = expenses.filter((exp: any) =>
    exp.employee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
        {expensesLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
                  <div className="flex items-center text-xs text-green-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {expenses.length} expenses
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
                    {expenses.filter((e: any) => e.status === 'approved').length} approved
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
                    {expenses.filter((e: any) => e.status === 'pending').length} pending
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
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
                {expensesLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No expenses found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.employee_name || 'Unknown'}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="font-medium">${expense.amount?.toFixed(2)}</TableCell>
                      <TableCell>{expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}</TableCell>
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
                  ))
                )}
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
          {budgetsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          ) : budgets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No budgets found
              </CardContent>
            </Card>
          ) : (
            budgets.map((budget: any) => (
              <motion.div key={budget.id} variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{budget.name}</CardTitle>
                      <Badge variant="outline">
                        {((budget.spent_amount / budget.total_amount) * 100).toFixed(0)}% used
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Spent</span>
                        <span className="font-medium">
                          ${budget.spent_amount?.toLocaleString()} / ${budget.total_amount?.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((budget.spent_amount / budget.total_amount) * 100, 100)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">
                        Remaining: ${(budget.total_amount - budget.spent_amount)?.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
