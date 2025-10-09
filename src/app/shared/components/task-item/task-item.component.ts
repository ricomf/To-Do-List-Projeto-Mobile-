import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonItem, IonLabel, IonCheckbox, IonChip, IonBadge, IonIcon,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { create, trash } from 'ionicons/icons';
import { ITask, TaskPriority, TaskStatus } from '../../../models';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  standalone: true,
  imports: [
    CommonModule, IonItem, IonLabel, IonCheckbox, IonChip, IonBadge,
    IonIcon, IonItemSliding, IonItemOptions, IonItemOption
  ]
})
export class TaskItemComponent {
  @Input() task!: ITask;
  @Input() showActions = true;
  @Output() taskToggle = new EventEmitter<ITask>();
  @Output() taskEdit = new EventEmitter<ITask>();
  @Output() taskDelete = new EventEmitter<ITask>();

  constructor() {
    addIcons({ create, trash });
  }

  onToggle() {
    this.taskToggle.emit(this.task);
  }

  onEdit() {
    this.taskEdit.emit(this.task);
  }

  onDelete() {
    this.taskDelete.emit(this.task);
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

  get isCompleted(): boolean {
    return this.task.status === TaskStatus.COMPLETED;
  }
}
