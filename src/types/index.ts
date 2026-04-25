export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
  meta: {
    timestamp: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  status: 'active' | 'pending' | 'suspended' | 'terminated';
  roles: string[];
  permissions?: string[];
  mfa_enabled: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  created_at: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
}

export interface Employee {
  id: string;
  user_id: string;
  employee_code: string;
  department_id?: string;
  manager_id?: string;
  hire_date: string;
  job_title: string;
  employment_type: 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance';
  status: string;
  salary?: number;
  currency: string;
  address?: string;
  city?: string;
  country?: string;
  created_at: string;
  // Expanded fields from user
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parent_id?: string;
  manager_id?: string;
  description?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client_id?: string;
  manager_id: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  budget?: number;
  pipeline_id?: string;
  tags: string[];
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date?: string;
  estimated_hours?: number;
  actual_hours: number;
  parent_id?: string;
  stage_id?: string;
  created_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  velocity?: number;
  created_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'achieved' | 'missed';
  deliverables?: string[];
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  industry?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  tax_id?: string;
  status: 'active' | 'inactive' | 'prospect';
  account_manager_id?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  employee_id: string;
  category: string;
  amount: number;
  description?: string;
  receipt_url?: string;
  incurred_at: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface Budget {
  id: string;
  project_id: string;
  name: string;
  total_amount: number;
  spent_amount: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'closed';
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project';
  project_id?: string;
  created_by: string;
  member_count?: number;
  unread_count?: number;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  type: 'text' | 'file' | 'system';
  parent_id?: string;
  edited_at?: string;
  reactions?: Reaction[];
  created_at: string;
}

export interface Reaction {
  emoji: string;
  user_id: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'company' | 'department' | 'project';
  scope_id?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  published_by: string;
  published_at: string;
  expires_at?: string;
  is_pinned: boolean;
  acknowledged_count: number;
  is_acknowledged?: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'hackathon' | 'game_night' | 'team_building' | 'party';
  start_date: string;
  end_date: string;
  location?: string;
  max_participants?: number;
  organizer_id: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  banner_url?: string;
  created_at: string;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  type: 'single_choice' | 'multiple_choice' | 'rating';
  options?: PollOption[];
  end_date?: string;
  created_by: string;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes?: number;
}

export interface Recognition {
  id: string;
  from_user_id: string;
  to_user_id: string;
  type: 'kudos' | 'award' | 'milestone';
  message: string;
  points: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name?: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  project_id?: string;
  status: 'active' | 'archived';
  created_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  color?: string;
  position: number;
  tasks?: Task[];
  created_at: string;
}
