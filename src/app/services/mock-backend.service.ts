import { Injectable } from '@angular/core';
import {
  IAuthResponse,
  ILogin,
  IRegister,
  ITask,
  TaskStatus,
  TaskPriority,
  UserRole
} from '../models';

/**
 * Mock Backend Service
 * Simula um backend para desenvolvimento sem API real
 */
@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  private readonly STORAGE_KEY = 'mock_users';
  private readonly TASKS_KEY = 'mock_tasks';

  constructor() {
    this.initializeMockData();
  }

  /**
   * Inicializa dados mock no localStorage
   */
  private initializeMockData() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.TASKS_KEY)) {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(this.getDefaultTasks()));
    }
  }

  /**
   * Simula login
   */
  async login(credentials: ILogin): Promise<IAuthResponse> {
    // Simula delay de rede
    await this.delay(500);

    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user || user.password !== credentials.password) {
      throw new Error('Email ou senha inválidos');
    }

    return this.createAuthResponse(user);
  }

  /**
   * Simula registro
   */
  async register(userData: IRegister): Promise<IAuthResponse> {
    // Simula delay de rede
    await this.delay(500);

    const users = this.getUsers();

    // Verifica se email já existe
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email já cadastrado');
    }

    // Verifica se senhas coincidem
    if (userData.password !== userData.confirmPassword) {
      throw new Error('As senhas não coincidem');
    }

    // Cria novo usuário
    const newUser = {
      id: this.generateId(),
      nome: userData.nome,
      email: userData.email,
      password: userData.password,
      avatarUrl: null,
      roles: [UserRole.USER],
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      ativo: true
    };

    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));

    return this.createAuthResponse(newUser);
  }

  /**
   * Cria resposta de autenticação
   */
  private createAuthResponse(user: any): IAuthResponse {
    const token = this.generateToken();
    const refreshToken = this.generateToken();

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        avatarUrl: user.avatarUrl,
        roles: user.roles
      },
      token,
      refreshToken,
      expiresIn: 3600
    };
  }

  /**
   * Retorna usuários do localStorage
   */
  private getUsers(): any[] {
    const users = localStorage.getItem(this.STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  }

  /**
   * Gera ID único
   */
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Gera token mock
   */
  private generateToken(): string {
    return 'mock_token_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Simula delay de rede
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Tarefas padrão para demonstração
   */
  private getDefaultTasks(): ITask[] {
    return [
      {
        id: '1',
        titulo: 'Configurar projeto Ionic',
        descricao: 'Instalar dependências e configurar ambiente de desenvolvimento',
        status: TaskStatus.COMPLETED,
        dataVencimento: new Date('2025-10-10'),
        dataCriacao: new Date('2025-10-01'),
        dataAtualizacao: new Date('2025-10-05'),
        prioridade: TaskPriority.HIGH,
        userId: 'user1',
        tags: ['setup', 'desenvolvimento'],
        isPublic: false,
        assignedTo: ['user1'],
        completed: true,
        completedAt: new Date('2025-10-05')
      },
      {
        id: '2',
        titulo: 'Implementar autenticação JWT',
        descricao: 'Criar sistema de login com tokens JWT e refresh tokens',
        status: TaskStatus.IN_PROGRESS,
        dataVencimento: new Date('2025-10-15'),
        dataCriacao: new Date('2025-10-02'),
        dataAtualizacao: new Date('2025-10-07'),
        prioridade: TaskPriority.URGENT,
        userId: 'user1',
        tags: ['backend', 'segurança'],
        isPublic: false,
        assignedTo: ['user1']
      },
      {
        id: '3',
        titulo: 'Design de UI/UX',
        descricao: 'Criar mockups e protótipos para as principais telas',
        status: TaskStatus.TODO,
        dataVencimento: new Date('2025-10-20'),
        dataCriacao: new Date('2025-10-03'),
        dataAtualizacao: new Date('2025-10-03'),
        prioridade: TaskPriority.MEDIUM,
        userId: 'user1',
        tags: ['design', 'ui/ux'],
        isPublic: false,
        assignedTo: ['user1']
      },
      {
        id: '4',
        titulo: 'Implementar tema escuro',
        descricao: 'Adicionar suporte completo para modo escuro',
        status: TaskStatus.TODO,
        dataVencimento: new Date('2025-10-25'),
        dataCriacao: new Date('2025-10-04'),
        dataAtualizacao: new Date('2025-10-04'),
        prioridade: TaskPriority.LOW,
        userId: 'user1',
        tags: ['frontend', 'ui'],
        isPublic: false,
        assignedTo: ['user1']
      }
    ];
  }
}
