import { z } from 'zod';

// Backend requires: user_id, employee_code, employment_type, hire_date, job_title
export const employeeSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  employee_code: z.string().min(1, 'Employee code is required'),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'intern', 'freelance']),
  hire_date: z.string().min(1, 'Hire date is required'),
  job_title: z.string().min(1, 'Job title is required'),
  department_id: z.string().optional(),
  salary: z.number().optional(),
  currency: z.string().optional(),
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
