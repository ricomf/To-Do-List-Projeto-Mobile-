import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem,
  IonLabel, IonToggle, IonIcon, IonListHeader, IonAvatar, IonButton,
  IonCard, IonCardContent, IonNote, AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  person, notifications, moon, language, logOut, help, shield,
  documentText, chevronForward, server, checkbox, bug, download, trash, mail
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
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

  dbPath: string = '';
  dbExists: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({
      person, notifications, moon, language, logOut, help, shield,
      documentText, chevronForward, server, checkbox, bug, download, trash, mail
    });
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadDatabaseInfo();
  }

  async loadDatabaseInfo() {
    try {
      this.dbPath = await this.databaseService.getDatabasePath();
      this.dbExists = await this.databaseService.checkDatabaseExists();
    } catch (error) {
      console.error('Error loading database info:', error);
    }
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

  async debugDatabase() {
    try {
      await this.databaseService.debugDatabase();
      const toast = await this.toastController.create({
        message: 'Verifique o console para ver os logs do banco de dados',
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error debugging database:', error);
      const toast = await this.toastController.create({
        message: 'Erro ao debugar banco de dados',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async exportDatabase() {
    try {
      await this.databaseService.downloadDatabaseAsJson();
      const toast = await this.toastController.create({
        message: 'Banco de dados exportado com sucesso',
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error exporting database:', error);
      const toast = await this.toastController.create({
        message: 'Erro ao exportar banco de dados',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async resetDatabase() {
    const alert = await this.alertController.create({
      header: 'Confirmar Reset',
      message: 'Tem certeza que deseja resetar o banco de dados? Todos os dados serão perdidos!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Resetar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.databaseService.close();

              // Reload the page to reinitialize the database
              window.location.reload();
            } catch (error) {
              console.error('Error resetting database:', error);
              const toast = await this.toastController.create({
                message: 'Erro ao resetar banco de dados',
                duration: 3000,
                position: 'bottom',
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
