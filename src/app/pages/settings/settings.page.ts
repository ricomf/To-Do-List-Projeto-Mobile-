import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonToggle, IonIcon, IonListHeader, IonAvatar, IonButton,
  IonCard, IonCardContent, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  person, notifications, moon, language, logOut, help, shield,
  documentText, chevronForward
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { IUserProfile, IUserPreferences, UserRole } from '../../models';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonToggle, IonIcon, IonListHeader, IonAvatar,
    IonButton, IonCard, IonCardContent, IonNote
  ]
})
export class SettingsPage implements OnInit {
  userProfile?: IUserProfile;
  preferences: IUserPreferences = {
    notificacoesEmail: true,
    notificacoesPush: true,
    tema: 'auto',
    idioma: 'pt-BR'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      person, notifications, moon, language, logOut, help, shield,
      documentText, chevronForward
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      // TODO: Replace with actual service call
      // Mock data for demonstration
      this.userProfile = {
        id: '1',
        nome: 'João Silva',
        email: 'joao@email.com',
        avatarUrl: undefined,
        roles: [UserRole.USER],
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
        ativo: true,
        preferencias: this.preferences
      };

      if (this.userProfile?.preferencias) {
        this.preferences = this.userProfile.preferencias;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async updatePreferences() {
    try {
      // TODO: Implement preferences update via service
      console.log('Updating preferences:', this.preferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  navigateToProfile() {
    // TODO: Navigate to profile edit page
    console.log('Navigate to profile');
  }

  navigateToHelp() {
    // TODO: Navigate to help page
    console.log('Navigate to help');
  }

  navigateToPrivacy() {
    // TODO: Navigate to privacy policy
    console.log('Navigate to privacy');
  }

  navigateToTerms() {
    // TODO: Navigate to terms of service
    console.log('Navigate to terms');
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
