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
  private useSQLite = false; // Will be set after DB initialization
  private useMockBackend = true; // Fallback to mock

  constructor(
    private apiService: ApiService,
    private sqliteTask: SQLiteTaskService,
    private authService: AuthService
  ) {
    console.log('[TaskService] Initialized');
    this.initializeTaskService();
  }

  /**
   * Initialize task service and check SQLite availability
   */
  private async initializeTaskService(): Promise<void> {
    try {
      console.log('[TaskService] Waiting for database initialization...');
      await this.authService.waitForInit();
      console.log('[TaskService] Database initialization complete');

      // Assume SQLite está disponível após a inicialização
      this.useSQLite = true;
      this.useMockBackend = false;
      console.log('[TaskService] ✅ SQLite initialized, will use SQLite for tasks');
    } catch (error) {
      console.error('[TaskService] ❌ SQLite initialization failed, using mock backend:', error);
      this.useSQLite = false;
      this.useMockBackend = true;
    }
  }

  /**
   * Wait for initialization before operations
   */
  private async ensureInitialized(): Promise<void> {
    // Wait for auth service initialization
    await this.authService.waitForInit();
  }

  /**
   * Get all tasks for current user
   */
  async getTasks(): Promise<ITask[]> {
    try {
      console.log('[TaskService] getTasks() called');

      // CRITICAL: Wait for initialization
      await this.ensureInitialized();

      const userId = this.authService.currentUserValue?.id;
      console.log('[TaskService] User ID:', userId);

      if (!userId) {
        console.log('[TaskService] ⚠️ No userId, returning empty tasks');
        return [];
      }

      console.log('[TaskService] useSQLite:', this.useSQLite, 'useMockBackend:', this.useMockBackend);

      let tasks: ITask[];

      if (this.useSQLite) {
        console.log('[TaskService] Fetching tasks from SQLite...');
        tasks = await this.sqliteTask.getTasks(userId);
        console.log('[TaskService] ✅ Got', tasks.length, 'tasks from SQLite');
      } else if (this.useMockBackend) {
        console.log('[TaskService] Fetching tasks from Mock Backend...');
        tasks = this.tasksSubject.value; // Return current tasks from memory
        console.log('[TaskService] ✅ Got', tasks.length, 'tasks from Mock');
      } else {
        console.log('[TaskService] Fetching tasks from API...');
        tasks = await lastValueFrom(this.apiService.get<ITask[]>('tasks'));
        console.log('[TaskService] ✅ Got', tasks.length, 'tasks from API');
      }

      this.tasksSubject.next(tasks);
      console.log('[TaskService] Tasks updated in subject. Total:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('[TaskService] ❌ Error fetching tasks:', error);
      console.error('[TaskService] Error details:', JSON.stringify(error));
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
      console.log('[TaskService] ========== CREATE TASK START ==========');
      console.log('[TaskService] taskData:', JSON.stringify(taskData, null, 2));

      // CRITICAL: Ensure database is initialized
      console.log('[TaskService] Ensuring initialization...');
      await this.ensureInitialized();
      console.log('[TaskService] Initialization complete');

      console.log('[TaskService] Current state:');
      console.log('[TaskService] - useSQLite:', this.useSQLite);
      console.log('[TaskService] - useMockBackend:', this.useMockBackend);

      const userId = this.authService.currentUserValue?.id;
      console.log('[TaskService] - userId:', userId);

      if (!userId) {
        console.error('[TaskService] ❌ ERROR: Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      let newTask: ITask;

      if (this.useSQLite) {
        console.log('[TaskService] ➡️  Creating task in SQLite...');
        try {
          newTask = await this.sqliteTask.createTask(taskData, userId);
          console.log('[TaskService] ✅ Task created in SQLite successfully!');
          console.log('[TaskService] Task ID:', newTask.id);
        } catch (sqliteError) {
          console.error('[TaskService] ❌ SQLite creation failed:', sqliteError);
          console.log('[TaskService] Falling back to Mock Backend...');
          this.useSQLite = false;
          this.useMockBackend = true;
          newTask = this.createMockTask(taskData, userId);
        }
      } else if (this.useMockBackend) {
        console.log('[TaskService] ➡️  Creating task in Mock Backend...');
        newTask = this.createMockTask(taskData, userId);
        console.log('[TaskService] ✅ Task created in Mock successfully!');
        console.log('[TaskService] Task ID:', newTask.id);
      } else {
        console.log('[TaskService] ➡️  Creating task via Real API...');
        newTask = await lastValueFrom(
          this.apiService.post<ITask>('tasks', taskData)
        );
        console.log('[TaskService] ✅ Task created via API successfully!');
        console.log('[TaskService] Task ID:', newTask.id);
      }

      // Update local tasks list
      const currentTasks = this.tasksSubject.value;
      const updatedTasks = [...currentTasks, newTask];
      this.tasksSubject.next(updatedTasks);
      console.log('[TaskService] Task list updated. Total tasks:', updatedTasks.length);
      console.log('[TaskService] ========== CREATE TASK END ==========');

      return newTask;
    } catch (error) {
      console.error('[TaskService] ========== CREATE TASK FAILED ==========');
      console.error('[TaskService] ❌ Error:', error);
      console.error('[TaskService] Error message:', (error as any)?.message);
      console.error('[TaskService] Error stack:', (error as any)?.stack);
      throw error;
    }
  }

  /**
   * Create a mock task (fallback when SQLite fails)
   */
  private createMockTask(taskData: ICreateTaskDto, userId: string): ITask {
    const now = new Date();
    return {
      id: 'mock-task-' + Date.now(),
      titulo: taskData.titulo,
      descricao: taskData.descricao || '',
      status: TaskStatus.TODO,
      prioridade: taskData.prioridade || 'medium' as any,
      dataCriacao: now,
      dataAtualizacao: now,
      dataVencimento: taskData.dataVencimento,
      userId: userId,
      tags: taskData.tags || [],
      isPublic: false,
      assignedTo: [],
      anexos: []
    };
  }

  /**
   * Update existing task
   */
  async updateTask(id: string, updates: IUpdateTaskDto): Promise<ITask> {
    try {
      console.log('[TaskService] Updating task:', id, updates);
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

      console.log('[TaskService] Task updated:', updatedTask);
      return updatedTask;
    } catch (error) {
      console.error('[TaskService] Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      console.log('[TaskService] Deleting task:', id);

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
      console.error('[TaskService] Error deleting task:', error);
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

}
