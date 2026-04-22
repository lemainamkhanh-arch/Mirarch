export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  status: 'Planning' | 'Design' | 'Construction' | 'Completed';
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  imageUrl: string;
  progress: number;
}

export interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'ToDo' | 'InProgress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
}

export interface SchedulePhase {
  phase: string;
  durationWeeks: number;
  details: string;
}

export interface AIResponse {
  suggestion: string;
  schedule?: SchedulePhase[];
}

export interface ProjectItem {
  id: string;
  name: string;
  type: 'Schedule' | 'Board' | 'Pinboard' | 'Document';
  sharedWith: string[];
  status: string;
  lastUpdated: string;
  updatedBy: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  PROJECT_DETAIL = 'PROJECT_DETAIL',
  SCHEDULE = 'SCHEDULE',
  DOCS = 'DOCS',
  AI_STUDIO = 'AI_STUDIO'
}