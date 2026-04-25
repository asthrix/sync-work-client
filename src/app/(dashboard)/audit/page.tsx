'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Clock, User, FileText } from 'lucide-react';

const auditLogs = [
  { id: 1, user: 'John Doe', action: 'Created project', resource: 'Project', details: 'Website Redesign', timestamp: '2025-01-25 10:30:00', ip: '192.168.1.1' },
  { id: 2, user: 'Jane Smith', action: 'Updated employee', resource: 'Employee', details: 'Changed department', timestamp: '2025-01-25 09:15:00', ip: '192.168.1.2' },
  { id: 3, user: 'Mike Johnson', action: 'Approved expense', resource: 'Expense', details: '$450.00 - Travel', timestamp: '2025-01-25 08:45:00', ip: '192.168.1.3' },
  { id: 4, user: 'Sarah Williams', action: 'Deleted task', resource: 'Task', details: 'Old API endpoint', timestamp: '2025-01-24 16:20:00', ip: '192.168.1.4' },
  { id: 5, user: 'Tom Brown', action: 'Login', resource: 'Auth', details: 'Successful login', timestamp: '2025-01-24 15:00:00', ip: '192.168.1.5' },
];

export default function AuditPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Track all system activities and changes.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell className="text-muted-foreground">{log.details}</TableCell>
                  <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
