// src/main.ts

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, CapacitorSQLite } from '@capacitor-community/sqlite';

// Importação crucial para o Jeep-SQLite
import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import { errorInterceptor } from './app/interceptors/error.interceptor';

// 🚨 NOVO: Variável global para sinalizar o status de inicialização
(window as any).isSQLiteInitialized = false; 

/**
 * Funções de inicialização pré-Angular.
 * Prepara o WebStore se a plataforma for 'web'.
 */
async function initializeApp() {
  
  if (Capacitor.getPlatform() === 'web') {
    // 1. Regista o componente customizado jeep-sqlite
    jeepSqlite(window);

    // Adiciona um pequeno delay para a conclusão do registo do Stencil.
    await new Promise(resolve => setTimeout(resolve, 50)); 

    try {
      console.log('[Main] Initializing WebStore...');
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      // 2. Inicializa o armazenamento web
      await sqlite.initWebStore(); 
      console.log('[Main] WebStore initialized!');
      
      // ✅ SUCESSO: Marca a variável global
      (window as any).isSQLiteInitialized = true;

    } catch (err) {
      console.error('[Main] ❌ SQLite Web initialization error:', err);
      // Em caso de falha, forçamos o Angular a não tentar usar o elemento jeep-sqlite
      (window as any).isSQLiteInitialized = false; 
      throw err;
    }
  } else {
    // Para plataformas nativas, consideramos pronto.
    (window as any).isSQLiteInitialized = true;
  }
}

// Inicialização e Bootstrap Angular
(async () => {
  try {
    // Primeiro, inicializa os componentes e o WebStore
    await initializeApp(); 

    // Depois, inicia a aplicação Angular
    bootstrapApplication(AppComponent, {
      providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(), 
        // Importa as rotas para o Router funcionar corretamente
        provideRouter(routes, withPreloading(PreloadAllModules)),
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
      ],
    }).catch(err => console.error('[Main] Bootstrap error:', err));
  } catch (err) {
    console.error('[Main] Application failed to start due to initialization error.');
  }
})();