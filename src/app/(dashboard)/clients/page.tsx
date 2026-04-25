'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Mail, Phone, Globe, TrendingUp } from 'lucide-react';
import { staggerContainer, itemVariants } from '@/lib/animations/variants';

const clients = [
  { id: 1, name: 'TechCorp Inc.', industry: 'Technology', status: 'active', revenue: '$450K', contacts: 3 },
  { id: 2, name: 'GreenEnergy Co.', industry: 'Energy', status: 'active', revenue: '$280K', contacts: 2 },
  { id: 3, name: 'HealthPlus', industry: 'Healthcare', status: 'prospect', revenue: '$0', contacts: 1 },
  { id: 4, name: 'FinanceHub', industry: 'Finance', status: 'active', revenue: '$620K', contacts: 4 },
];

export default function ClientsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage your client relationships.</p>
        </div>
        <Button>Add Client</Button>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2"
      >
        {clients.map((client) => (
          <motion.div key={client.id} variants={itemVariants}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {client.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{client.industry}</p>
                      </div>
                    </div>
                    <Badge
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                      className={client.status === 'prospect' ? 'bg-blue-500/10 text-blue-500' : ''}
                    >
                      {client.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Annual Revenue</span>
                    <span className="font-medium">{client.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Contacts</span>
                    <span className="font-medium">{client.contacts}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                    <Button variant="outline" size="sm" className="flex-1">New Project</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
