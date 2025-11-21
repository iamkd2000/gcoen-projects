export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category?: string;
  createdAt: number;
  completedAt?: number;
  subtasks: SubTask[];
  isExpanded?: boolean; // UI state
  points: number; // Gamification points
}

export interface DailyMemory {
  date: string; // YYYY-MM-DD
  note: string;
  image?: string; // Base64 string
}