import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent, IonFab, IonFabButton,
  IonIcon, IonChip, IonLabel, IonProgressBar, IonButtons, IonButton,
  IonRefresher, IonRefresherContent, IonGrid, IonRow, IonCol, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, briefcase, people, calendar } from 'ionicons/icons';
import { IProject, ProjectStatus } from '../../models';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonFab, IonFabButton, IonIcon, IonChip, IonLabel, IonProgressBar,
    IonButtons, IonButton, IonRefresher, IonRefresherContent, IonGrid,
    IonRow, IonCol, IonBadge
  ]
})
export class ProjectsPage implements OnInit {
  projects: IProject[] = [];
  isLoading = false;

  constructor(private router: Router) {
    addIcons({ add, briefcase, people, calendar });
  }

  ngOnInit() {
    this.loadProjects();
  }

  async loadProjects() {
    this.isLoading = true;
    try {
      // TODO: Replace with actual service call
      // Mock data for demonstration
      this.projects = [
        {
          id: '1',
          nome: 'Projeto Demo',
          descricao: 'Este é um projeto de demonstração',
          status: ProjectStatus.ACTIVE,
          dataCriacao: new Date(),
          dataAtualizacao: new Date(),
          ownerId: 'user1',
          tasks: [],
          members: [
            {
              userId: 'user1',
              nome: 'João Silva',
              email: 'joao@email.com',
              role: 'OWNER',
              dataEntrada: new Date()
            }
          ],
          cor: '#3880ff',
          isPublic: false
        }
      ];
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async handleRefresh(event: any) {
    await this.loadProjects();
    event.target.complete();
  }

  viewProject(project: IProject) {
    // TODO: Navigate to project details page
    console.log('View project:', project.id);
  }

  createNewProject() {
    // TODO: Navigate to project creation page
    console.log('Create new project');
  }

  getStatusColor(status: ProjectStatus): string {
    const colors: { [key in ProjectStatus]: string } = {
      [ProjectStatus.ACTIVE]: 'success',
      [ProjectStatus.COMPLETED]: 'primary',
      [ProjectStatus.ARCHIVED]: 'medium',
      [ProjectStatus.ON_HOLD]: 'warning'
    };
    return colors[status];
  }

  getStatusLabel(status: ProjectStatus): string {
    const labels: { [key in ProjectStatus]: string } = {
      [ProjectStatus.ACTIVE]: 'Ativo',
      [ProjectStatus.COMPLETED]: 'Concluído',
      [ProjectStatus.ARCHIVED]: 'Arquivado',
      [ProjectStatus.ON_HOLD]: 'Em Espera'
    };
    return labels[status];
  }

  getProjectProgress(project: IProject): number {
    if (project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.completed).length;
    return completedTasks / project.tasks.length;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
