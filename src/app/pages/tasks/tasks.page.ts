import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,
  IonIcon, IonList, IonItem, IonLabel, IonChip, IonBadge, IonSegment,
  IonSegmentButton, IonSearchbar, IonButtons, IonButton, IonRefresher,
  IonRefresherContent, IonItemSliding, IonItemOptions, IonItemOption,
  IonCheckbox
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, search, filter, checkmark, trash, create } from 'ionicons/icons';
import { TaskService } from '../../services/task.service';
import { ITask, TaskStatus, TaskPriority } from '../../models';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonFab, IonFabButton, IonIcon, IonList, IonItem, IonLabel, IonChip,
    IonBadge, IonSegment, IonSegmentButton, IonSearchbar, IonButtons,
    IonButton, IonRefresher, IonRefresherContent, IonItemSliding,
    IonItemOptions, IonItemOption, IonCheckbox
  ]
})
export class TasksPage implements OnInit {
  tasks: ITask[] = [];
  filteredTasks: ITask[] = [];
  selectedSegment: 'all' | 'todo' | 'inprogress' | 'completed' = 'all';
  searchQuery = '';
  isLoading = false;

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {
    console.log('[TasksPage] Constructor called');
    addIcons({ add, search, filter, checkmark, trash, create });
  }

  ngOnInit() {
    console.log('[TasksPage] ngOnInit called');
    this.loadTasks();
    this.subscribeToTaskUpdates();
  }

  subscribeToTaskUpdates() {
    // Subscribe to task updates for real-time updates
    this.taskService.tasks$.subscribe(tasks => {
      console.log('[TasksPage] Tasks updated via subscription:', tasks.length);
      this.tasks = tasks;
      this.applyFilters();
    });
  }

  async loadTasks() {
    this.isLoading = true;
    try {
      this.tasks = await this.taskService.getTasks();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async handleRefresh(event: any) {
    await this.loadTasks();
    event.target.complete();
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value?.toLowerCase() || '';
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.tasks];

    // Filter by status segment
    if (this.selectedSegment !== 'all') {
      const statusMap: { [key: string]: TaskStatus } = {
        'todo': TaskStatus.TODO,
        'inprogress': TaskStatus.IN_PROGRESS,
        'completed': TaskStatus.COMPLETED
      };
      filtered = filtered.filter(task => task.status === statusMap[this.selectedSegment]);
    }

    // Filter by search query
    if (this.searchQuery) {
      filtered = filtered.filter(task =>
        task.titulo.toLowerCase().includes(this.searchQuery) ||
        task.descricao?.toLowerCase().includes(this.searchQuery)
      );
    }

    this.filteredTasks = filtered;
  }

  async toggleTaskStatus(task: ITask) {
    try {
      console.log('[TasksPage] Toggling task status:', task.id, 'current status:', task.status);
      const newStatus = task.status === TaskStatus.COMPLETED
        ? TaskStatus.TODO
        : TaskStatus.COMPLETED;

      console.log('[TasksPage] New status will be:', newStatus);
      await this.taskService.updateTask(task.id, { status: newStatus });
      console.log('[TasksPage] Task updated - UI will update automatically via subscription');
      // No need to reload - subscription will update automatically
    } catch (error) {
      console.error('[TasksPage] Error updating task:', error);
    }
  }

  async deleteTask(task: ITask) {
    try {
      await this.taskService.deleteTask(task.id);
      // No need to reload - subscription will update automatically
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  editTask(task: ITask) {
    this.router.navigate(['/task-form', task.id]);
  }

  createNewTask() {
    this.router.navigate(['/task-form']);
  }

  getPriorityColor(priority: TaskPriority): string {
    const colors: { [key in TaskPriority]: string } = {
      [TaskPriority.LOW]: 'success',
      [TaskPriority.MEDIUM]: 'warning',
      [TaskPriority.HIGH]: 'danger',
      [TaskPriority.URGENT]: 'danger'
    };
    return colors[priority];
  }

  getPriorityLabel(priority: TaskPriority): string {
    const labels: { [key in TaskPriority]: string } = {
      [TaskPriority.LOW]: 'Baixa',
      [TaskPriority.MEDIUM]: 'Média',
      [TaskPriority.HIGH]: 'Alta',
      [TaskPriority.URGENT]: 'Urgente'
    };
    return labels[priority];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
