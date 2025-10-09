import { ITask } from './task.model';

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  ON_HOLD = 'ON_HOLD'
}

export interface IProjectMember {
  userId: string;
  nome: string;
  email: string;
  avatarUrl?: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  dataEntrada: Date;
}

export interface IProject {
  id: string;
  nome: string;
  descricao?: string;
  status: ProjectStatus;
  dataCriacao: Date;
  dataAtualizacao: Date;
  dataInicio?: Date;
  dataFim?: Date;
  ownerId: string;
  tasks: ITask[];
  members: IProjectMember[];
  cor?: string;
  icon?: string;
  isPublic: boolean;
}

export interface ICreateProjectDto {
  nome: string;
  descricao?: string;
  dataInicio?: Date;
  dataFim?: Date;
  cor?: string;
  icon?: string;
  isPublic?: boolean;
  members?: string[]; // Array de user IDs
}

export interface IUpdateProjectDto {
  nome?: string;
  descricao?: string;
  status?: ProjectStatus;
  dataInicio?: Date;
  dataFim?: Date;
  cor?: string;
  icon?: string;
  isPublic?: boolean;
}

export interface IProjectInvite {
  projectId: string;
  email: string;
  role: 'ADMIN' | 'MEMBER' | 'VIEWER';
}
