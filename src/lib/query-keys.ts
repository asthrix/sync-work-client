export const queryKeys = {
  auth: {
    me: ['me'],
  },
  users: {
    all: ['users'],
    detail: (id: string) => ['users', id],
  },
  staff: {
    all: ['employees'],
    detail: (id: string) => ['employees', id],
    departments: ['departments'],
    attendance: ['attendance'],
    leaves: ['leaves'],
  },
  projects: {
    all: ['projects'],
    detail: (id: string) => ['projects', id],
    tasks: (projectId: string) => ['tasks', projectId],
    sprints: (projectId: string) => ['sprints', projectId],
    milestones: (projectId: string) => ['milestones', projectId],
  },
  clients: {
    all: ['clients'],
    detail: (id: string) => ['clients', id],
    contracts: ['contracts'],
  },
  finance: {
    expenses: ['expenses'],
    budgets: ['budgets'],
    payroll: ['payroll'],
  },
  communication: {
    rooms: ['rooms'],
    messages: (roomId: string) => ['messages', roomId],
    announcements: ['announcements'],
    notifications: ['notifications'],
    unreadCount: ['unread-count'],
  },
  culture: {
    events: ['events'],
    polls: ['polls'],
    recognitions: ['recognitions'],
    leaderboard: ['leaderboard'],
  },
};
