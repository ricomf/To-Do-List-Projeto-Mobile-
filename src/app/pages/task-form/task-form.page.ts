import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonBackButton, IonList, IonItem, IonLabel, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonDatetime, IonChip, IonIcon,
  IonDatetimeButton, IonModal, NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, close, add } from 'ionicons/icons';
import { TaskService } from '../../services/task.service';
import { TaskStatus, TaskPriority, ICreateTaskDto, IUpdateTaskDto } from '../../models';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.page.html',
  styleUrls: ['./task-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonBackButton, IonList, IonItem,
    IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption,
    IonDatetime, IonChip, IonIcon, IonDatetimeButton, IonModal
  ]
})
export class TaskFormPage implements OnInit {
  taskForm!: FormGroup;
  isEditMode = false;
  taskId?: string;
  tags: string[] = [];
  newTag = '';
  minDate: string;

  readonly TaskStatus = TaskStatus;
  readonly TaskPriority = TaskPriority;

  priorities = [
    { value: TaskPriority.LOW, label: 'Baixa' },
    { value: TaskPriority.MEDIUM, label: 'Média' },
    { value: TaskPriority.HIGH, label: 'Alta' },
    { value: TaskPriority.URGENT, label: 'Urgente' }
  ];

  statuses = [
    { value: TaskStatus.TODO, label: 'A Fazer' },
    { value: TaskStatus.IN_PROGRESS, label: 'Em Andamento' },
    { value: TaskStatus.COMPLETED, label: 'Concluída' }
  ];

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {
    addIcons({ save, close, add });
    this.minDate = new Date().toISOString();
  }

  ngOnInit() {
    this.initForm();
    this.checkEditMode();
  }

  initForm() {
    this.taskForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      descricao: [''],
      status: [TaskStatus.TODO, Validators.required],
      prioridade: [TaskPriority.MEDIUM, Validators.required],
      dataVencimento: [null],
      projectId: [null],
      categoryId: [null]
    });
  }

  async checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.taskId = id;
      await this.loadTask();
    }
  }

  async loadTask() {
    if (!this.taskId) return;

    try {
      const tasks = await this.taskService.getTasks();
      const task = tasks.find(t => t.id === this.taskId);

      if (task) {
        this.taskForm.patchValue({
          titulo: task.titulo,
          descricao: task.descricao,
          status: task.status,
          prioridade: task.prioridade,
          dataVencimento: task.dataVencimento ? new Date(task.dataVencimento).toISOString() : null,
          projectId: task.projectId,
          categoryId: task.categoryId
        });
        this.tags = task.tags || [];
      }
    } catch (error) {
      console.error('Error loading task:', error);
    }
  }

  addTag() {
    const tag = this.newTag.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.newTag = '';
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter(t => t !== tag);
  }

  async onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    try {
      const formValue = this.taskForm.value;

      if (this.isEditMode && this.taskId) {
        const updateData: IUpdateTaskDto = {
          titulo: formValue.titulo,
          descricao: formValue.descricao,
          status: formValue.status,
          prioridade: formValue.prioridade,
          dataVencimento: formValue.dataVencimento ? new Date(formValue.dataVencimento) : undefined,
          tags: this.tags,
          categoryId: formValue.categoryId
        };
        await this.taskService.updateTask(this.taskId, updateData);
      } else {
        const createData: ICreateTaskDto = {
          titulo: formValue.titulo,
          descricao: formValue.descricao,
          prioridade: formValue.prioridade,
          dataVencimento: formValue.dataVencimento ? new Date(formValue.dataVencimento) : undefined,
          tags: this.tags,
          projectId: formValue.projectId,
          categoryId: formValue.categoryId
        };
        await this.taskService.createTask(createData);
      }

      this.navCtrl.back();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }

  cancel() {
    this.navCtrl.back();
  }

  getPriorityLabel(priority: TaskPriority): string {
    return this.priorities.find(p => p.value === priority)?.label || '';
  }

  getStatusLabel(status: TaskStatus): string {
    return this.statuses.find(s => s.value === status)?.label || '';
  }
}
