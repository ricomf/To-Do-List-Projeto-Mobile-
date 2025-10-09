import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { SQLiteTaskService } from './sqlite-task.service';
import { AuthService } from './auth.service';
import { ITask, ICreateTaskDto, IUpdateTaskDto, TaskStatus } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<ITask[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  private useSQLite = true;

  constructor(
    private apiService: ApiService,
    private sqliteTask: SQLiteTaskService,
    private authService: AuthService
  ) {}

  /**
   * Get all tasks for current user
   */
  async getTasks(): Promise<ITask[]> {
    try {
      const userId = this.authService.currentUserValue?.id;

      if (!userId) {
        return [];
      }

      let tasks: ITask[];

      if (this.useSQLite) {
        tasks = await this.sqliteTask.getTasks(userId);
      } else {
        tasks = await lastValueFrom(this.apiService.get<ITask[]>('tasks'));
      }

      this.tasksSubject.next(tasks);
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<ITask | null> {
    try {
      if (this.useSQLite) {
        return await this.sqliteTask.getTaskById(id);
      } else {
        return await lastValueFrom(
          this.apiService.get<ITask>(`tasks/${id}`)
        );
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      return null;
    }
  }

  /**
   * Create new task
   */
  async createTask(taskData: ICreateTaskDto): Promise<ITask> {
    try {
      const userId = this.authService.currentUserValue?.id;
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      let newTask: ITask;

      if (this.useSQLite) {
        newTask = await this.sqliteTask.createTask(taskData, userId);
      } else {
        newTask = await lastValueFrom(
          this.apiService.post<ITask>('tasks', taskData)
        );
      }

      // Update local tasks list
      const currentTasks = this.tasksSubject.value;
      this.tasksSubject.next([...currentTasks, newTask]);

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update existing task
   */
  async updateTask(id: string, updates: IUpdateTaskDto): Promise<ITask> {
    try {
      let updatedTask: ITask;

      if (this.useSQLite) {
        updatedTask = await this.sqliteTask.updateTask(id, updates);
      } else {
        updatedTask = await lastValueFrom(
          this.apiService.patch<ITask>(`tasks/${id}`, updates)
        );
      }

      // Update local tasks list
      const currentTasks = this.tasksSubject.value;
      const index = currentTasks.findIndex(t => t.id === id);
      if (index !== -1) {
        currentTasks[index] = updatedTask;
        this.tasksSubject.next([...currentTasks]);
      }

      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      if (this.useSQLite) {
        await this.sqliteTask.deleteTask(id);
      } else {
        await lastValueFrom(
          this.apiService.delete(`tasks/${id}`)
        );
      }

      // Update local tasks list
      const currentTasks = this.tasksSubject.value;
      this.tasksSubject.next(currentTasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Get tasks by project ID
   */
  async getTasksByProject(projectId: string): Promise<ITask[]> {
    try {
      return await lastValueFrom(
        this.apiService.get<ITask[]>(`tasks/project/${projectId}`)
      );
    } catch (error) {
      console.error('Error fetching project tasks:', error);
      throw error;
    }
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): ITask[] {
    return this.tasksSubject.value.filter(task => task.status === status);
  }

  /**
   * Search tasks
   */
  searchTasks(query: string): ITask[] {
    const lowerQuery = query.toLowerCase();
    return this.tasksSubject.value.filter(task =>
      task.titulo.toLowerCase().includes(lowerQuery) ||
      task.descricao?.toLowerCase().includes(lowerQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get mock tasks for development
   */
  private getMockTasks(): ITask[] {
    return [
      {
        id: '1',
        titulo: 'Implementar autenticação JWT',
        descricao: 'Criar sistema de autenticação com JWT e refresh tokens',
        status: TaskStatus.IN_PROGRESS,
        dataVencimento: new Date('2025-10-15'),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        prioridade: 'HIGH' as any,
        userId: 'user1',
        tags: ['backend', 'segurança'],
        isPublic: false,
        assignedTo: ['user1']
      },
      {
        id: '2',
        titulo: 'Design da interface de usuário',
        descricao: 'Criar mockups para as principais telas',
        status: TaskStatus.TODO,
        dataVencimento: new Date('2025-10-20'),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        prioridade: 'MEDIUM' as any,
        userId: 'user1',
        tags: ['design', 'ui/ux'],
        isPublic: false,
        assignedTo: ['user1']
      },
      {
        id: '3',
        titulo: 'Configurar CI/CD',
        descricao: 'Implementar pipeline de integração e deploy contínuo',
        status: TaskStatus.COMPLETED,
        dataVencimento: new Date('2025-10-10'),
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        prioridade: 'LOW' as any,
        userId: 'user1',
        tags: ['devops', 'automação'],
        isPublic: false,
        assignedTo: ['user1'],
        completed: true,
        completedAt: new Date()
      }
    ];
  }
}
