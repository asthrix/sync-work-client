import { z } from 'zod';

export const employeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  department_id: z.string().min(1, 'Department is required'),
  job_title: z.string().min(1, 'Job title is required'),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  due_date: z.string().min(1, 'Due date is required'),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

export const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required'),
  industry: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
