import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private isInitialized = false;
  private platform: string;

  constructor() {
    this.platform = Capacitor.getPlatform();
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initWebStore(): Promise<void> {
    if (this.platform === 'web') {
      await CapacitorSQLite.initWebStore();
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize web store for browser
      if (this.platform === 'web') {
        await this.initWebStore();
      }

      // Create connection
      this.db = await this.sqlite.createConnection(
        'meuapp_db',
        false,
        'no-encryption',
        1,
        false
      );

      // Open database
      await this.db.open();

      // Run migrations
      await this.createTables();

      this.isInitialized = true;
      console.log(`Database initialized successfully on ${this.platform}`);
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createTablesSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar_url TEXT,
        telefone TEXT,
        data_nascimento TEXT,
        bio TEXT,
        roles TEXT NOT NULL,
        data_criacao TEXT NOT NULL,
        ultima_atualizacao TEXT NOT NULL
      );

      -- User preferences table
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        tema TEXT DEFAULT 'auto',
        idioma TEXT DEFAULT 'pt-BR',
        notificacoes_push INTEGER DEFAULT 1,
        notificacoes_email INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Categories table
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cor TEXT NOT NULL,
        icone TEXT,
        user_id TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        cor TEXT NOT NULL,
        is_public INTEGER DEFAULT 0,
        criado_por TEXT NOT NULL,
        status TEXT NOT NULL,
        data_criacao TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL,
        FOREIGN KEY (criado_por) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Project members table
      CREATE TABLE IF NOT EXISTS project_members (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL,
        adicionado_em TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(project_id, user_id)
      );

      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        descricao TEXT,
        status TEXT NOT NULL,
        prioridade TEXT NOT NULL,
        data_criacao TEXT NOT NULL,
        data_atualizacao TEXT NOT NULL,
        data_vencimento TEXT,
        data_conclusao TEXT,
        user_id TEXT NOT NULL,
        project_id TEXT,
        category_id TEXT,
        tags TEXT,
        anexos TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      -- Auth tokens table
      CREATE TABLE IF NOT EXISTS auth_tokens (
        user_id TEXT PRIMARY KEY,
        token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(criado_por);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `;

    await this.db.execute(createTablesSQL);
  }

  async getDb(): Promise<SQLiteDBConnection> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.db;
  }

  async query(sql: string, params: any[] = []): Promise<any> {
    const db = await this.getDb();
    return await db.query(sql, params);
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const db = await this.getDb();
    return await db.run(sql, params);
  }

  async executeBatch(statements: string[]): Promise<void> {
    const db = await this.getDb();
    await db.execute(statements.join('; '));
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.isInitialized = false;
    }
  }

  // Helper method to generate UUID
  generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Helper to convert Date to ISO string for SQLite
  dateToSQL(date: Date): string {
    return date.toISOString();
  }

  // Helper to convert ISO string from SQLite to Date
  sqlToDate(dateString: string): Date {
    return new Date(dateString);
  }
}
