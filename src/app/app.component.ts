// src/app/app.component.ts (Conteúdo COMPLETO)

import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone'; 
import { DatabaseService } from './services/database.service';
import { Capacitor } from '@capacitor/core'; // Importação crucial

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, CommonModule, RouterModule], 
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  standalone: true
})
export class AppComponent implements OnInit {
  
  public isWebstoreReady: boolean = false; 

  // ✅ CORREÇÃO: As funções de debug são definidas aqui, garantindo que existam.
  constructor(private database: DatabaseService) {
    console.log('[AppComponent] Initializing...');

    // ⬇️ FUNÇÕES DE DEBUG AGORA NO CONSTRUCTOR ⬇️
    (window as any).db = this.database;
    (window as any).debugDatabase = async () => {
      console.log('Starting database debug...');
      // O método do serviço fará a inicialização se ainda não tiver sido feita.
      await this.database.debugDatabase(); 
    };
    (window as any).exportDatabase = async () => {
      console.log('Exporting database...');
      await this.database.downloadDatabaseAsJson();
    };
    (window as any).getDatabasePath = async () => {
      const path = await this.database.getDatabasePath();
      console.log('Database path:', path);
      return path;
    };

    console.log('[AppComponent] 🔧 Debug functions available:');
    console.log('  - await window.debugDatabase() - Show all database info');
    console.log('  - await window.exportDatabase() - Download database as JSON');
    console.log('  - await window.getDatabasePath() - Get database file path');
    console.log('  - window.db - Direct access to DatabaseService');
    // ⬆️ FUNÇÕES DE DEBUG AGORA NO CONSTRUCTOR ⬆️

    // Clear old invalid tokens
    const token = localStorage.getItem('auth_token');
    if (token && (!token.includes('.') || token.split('.').length !== 3)) {
      console.log('[AppComponent] Clearing invalid old token format');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  }

  async ngOnInit() {
    // Lógica de Polling para o WebStore
    if (Capacitor.getPlatform() === 'web') { 
      console.log('[AppComponent] Waiting for SQLite WebStore initialization...');
      
      let attempts = 0;
      while (!(window as any).isSQLiteInitialized && attempts < 40) {
        await new Promise(resolve => setTimeout(resolve, 50)); 
        attempts++;
      }

      if ((window as any).isSQLiteInitialized) {
        this.isWebstoreReady = true;
        console.log(`[AppComponent] WebStore ready after ${attempts * 50}ms.`);
      } else {
        console.error('[AppComponent] ❌ Timeout waiting for WebStore initialization!');
      }
    } else {
      this.isWebstoreReady = true;
    }

    try {
      console.log('[AppComponent] Initializing database...');
      // AQUI CONTINUA SÓ A CHAMADA DE INICIALIZAÇÃO.
      await this.database.initialize(); 
      console.log('[AppComponent] ✅ Database initialized successfully');
      
    } catch (error) {
      // Se houver erro, a função de debug ainda existe, mas a inicialização falhou.
      console.error('[AppComponent] ❌ Failed to initialize database:', error);
      throw error;
    }
  }
}