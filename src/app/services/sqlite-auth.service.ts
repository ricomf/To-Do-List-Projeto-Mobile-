import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { IUser, ILogin, IRegister, IAuthResponse, UserRole } from '../models';
import * as bcrypt from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class SQLiteAuthService {
  constructor(private db: DatabaseService) {}

  async register(userData: IRegister): Promise<IAuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await this.db.query(
        'SELECT * FROM users WHERE email = ?',
        [userData.email]
      );

      if (existingUser.values && existingUser.values.length > 0) {
        throw new Error('Email já cadastrado');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Generate user ID
      const userId = this.db.generateId();
      const now = this.db.dateToSQL(new Date());

      // Insert user
      await this.db.run(
        `INSERT INTO users (id, nome, email, password, roles, data_criacao, ultima_atualizacao)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, userData.nome, userData.email, hashedPassword, JSON.stringify([UserRole.USER]), now, now]
      );

      // Create default preferences
      await this.db.run(
        `INSERT INTO user_preferences (user_id, tema, idioma, notificacoes_push, notificacoes_email)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, 'auto', 'pt-BR', 1, 1]
      );

      // Generate tokens
      const token = this.generateToken();
      const refreshToken = this.generateToken();
      const expiresAt = this.db.dateToSQL(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours

      // Store tokens
      await this.db.run(
        `INSERT INTO auth_tokens (user_id, token, refresh_token, expires_at)
         VALUES (?, ?, ?, ?)`,
        [userId, token, refreshToken, expiresAt]
      );

      // Fetch created user
      const user = await this.getUserById(userId);

      return {
        user: user!,
        token,
        refreshToken,
        expiresIn: 86400
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao criar conta');
    }
  }

  async login(credentials: ILogin): Promise<IAuthResponse> {
    try {
      // Find user by email
      const result = await this.db.query(
        'SELECT * FROM users WHERE email = ?',
        [credentials.email]
      );

      if (!result.values || result.values.length === 0) {
        throw new Error('Email ou senha inválidos');
      }

      const userData = result.values[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, userData.password);

      if (!isPasswordValid) {
        throw new Error('Email ou senha inválidos');
      }

      // Generate new tokens
      const token = this.generateToken();
      const refreshToken = this.generateToken();
      const expiresAt = this.db.dateToSQL(new Date(Date.now() + 24 * 60 * 60 * 1000));

      // Update or insert tokens
      await this.db.run(
        `INSERT OR REPLACE INTO auth_tokens (user_id, token, refresh_token, expires_at)
         VALUES (?, ?, ?, ?)`,
        [userData.id, token, refreshToken, expiresAt]
      );

      // Get user with preferences
      const user = await this.getUserById(userData.id);

      return {
        user: user!,
        token,
        refreshToken,
        expiresIn: 86400
      };
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao fazer login');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.db.run('DELETE FROM auth_tokens WHERE user_id = ?', [userId]);
  }

  async refreshToken(refreshToken: string): Promise<IAuthResponse | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM auth_tokens WHERE refresh_token = ?',
        [refreshToken]
      );

      if (!result.values || result.values.length === 0) {
        return null;
      }

      const tokenData = result.values[0];

      // Check if token is expired
      const expiresAt = new Date(tokenData.expires_at);
      if (expiresAt < new Date()) {
        await this.db.run('DELETE FROM auth_tokens WHERE user_id = ?', [tokenData.user_id]);
        return null;
      }

      // Generate new tokens
      const newToken = this.generateToken();
      const newRefreshToken = this.generateToken();
      const newExpiresAt = this.db.dateToSQL(new Date(Date.now() + 24 * 60 * 60 * 1000));

      // Update tokens
      await this.db.run(
        `UPDATE auth_tokens SET token = ?, refresh_token = ?, expires_at = ? WHERE user_id = ?`,
        [newToken, newRefreshToken, newExpiresAt, tokenData.user_id]
      );

      // Get user
      const user = await this.getUserById(tokenData.user_id);

      return {
        user: user!,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 86400
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  async validateToken(token: string): Promise<IUser | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM auth_tokens WHERE token = ?',
        [token]
      );

      if (!result.values || result.values.length === 0) {
        return null;
      }

      const tokenData = result.values[0];

      // Check if token is expired
      const expiresAt = new Date(tokenData.expires_at);
      if (expiresAt < new Date()) {
        await this.db.run('DELETE FROM auth_tokens WHERE user_id = ?', [tokenData.user_id]);
        return null;
      }

      return await this.getUserById(tokenData.user_id);
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  private async getUserById(userId: string): Promise<IUser | null> {
    try {
      const userResult = await this.db.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (!userResult.values || userResult.values.length === 0) {
        return null;
      }

      const userData = userResult.values[0];

      // Get preferences
      const prefsResult = await this.db.query(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [userId]
      );

      const preferences = prefsResult.values?.[0] || {
        tema: 'auto',
        idioma: 'pt-BR',
        notificacoes_push: true,
        notificacoes_email: true
      };

      // Convert database row to IUser
      const user: IUser = {
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        avatarUrl: userData.avatar_url,
        telefone: userData.telefone,
        dataNascimento: userData.data_nascimento ? this.db.sqlToDate(userData.data_nascimento) : undefined,
        bio: userData.bio,
        roles: JSON.parse(userData.roles),
        dataCriacao: this.db.sqlToDate(userData.data_criacao),
        dataAtualizacao: this.db.sqlToDate(userData.ultima_atualizacao),
        ativo: Boolean(userData.ativo),
        preferencias: {
          tema: preferences.tema,
          idioma: preferences.idioma,
          notificacoesPush: Boolean(preferences.notificacoes_push),
          notificacoesEmail: Boolean(preferences.notificacoes_email)
        }
      };

      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  private generateToken(): string {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}
