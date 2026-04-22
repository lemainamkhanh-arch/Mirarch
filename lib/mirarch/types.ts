export type ProjectStatus = 'Planning' | 'Design' | 'Construction' | 'Completed'
export type TaskStatus = 'ToDo' | 'InProgress' | 'Review' | 'Done'
export type TaskPriority = 'Low' | 'Medium' | 'High'
export type TaskType = 'Procurement' | 'Design' | 'Construction' | 'Admin' | 'Meeting'

export interface Project {
  id: string
  name: string
  client: string
  status: ProjectStatus
  budget: number
  startDate: string
  endDate: string
  coverUrl?: string
}

export interface Task {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  dueDate?: string
  assignee?: string
}
