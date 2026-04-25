'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Pencil, Trash2, Save, X } from 'lucide-react';
import { useClient, useUpdateClient, useDeleteClient } from '@/hooks/use-clients';
import { toast } from 'sonner';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const clientUpdateSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  industry: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type ClientUpdateForm = z.infer<typeof clientUpdateSchema>;

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading, error } = useClient(id);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const client = data?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientUpdateForm>({
    resolver: zodResolver(clientUpdateSchema),
    values: client ? {
      name: client.name,
      industry: client.industry || '',
      email: client.email || '',
      phone: client.phone || '',
    } : undefined,
  });

  const onSubmit = async (formData: ClientUpdateForm) => {
    try {
      await updateClient.mutateAsync({ id, data: formData });
      toast.success('Client updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to update client');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      await deleteClient.mutateAsync(id);
      toast.success('Client deleted successfully');
      router.push('/clients');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete client');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-9 w-48" />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-16 w-16 rounded-full" />
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

  if (error || !client) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load client</h2>
          <Link href="/clients" className={buttonVariants({ variant: 'default' })}>Back to Clients</Link>
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
        <Link href="/clients" className={buttonVariants({ variant: 'ghost' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Clients
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
              <Button onClick={handleSubmit(onSubmit)} disabled={updateClient.isPending}>
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
                {client.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'CL'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{client.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{client.industry || 'No industry'}</p>
              <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>{client.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" {...register('industry')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </form>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{client.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{client.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <p className="font-medium">{client.website || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{client.address || 'N/A'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
