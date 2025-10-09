import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, lastValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { MockBackendService } from './mock-backend.service';
import { SQLiteAuthService } from './sqlite-auth.service';
import { DatabaseService } from './database.service';
import { ILogin, IRegister, IAuthResponse, ITokenPayload, IUser } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private useSQLite = true; // Use SQLite by default
  private useMockBackend = false; // Fallback to mock if needed
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';

  private currentUserSubject = new BehaviorSubject<IUser | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private mockBackend: MockBackendService,
    private sqliteAuth: SQLiteAuthService,
    private database: DatabaseService
  ) {
    this.initializeDatabase();
    this.checkTokenExpiration();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await this.database.initialize();
      console.log('SQLite database initialized');
    } catch (error) {
      console.error('Failed to initialize SQLite, falling back to mock backend:', error);
      this.useSQLite = false;
      this.useMockBackend = true;
    }
  }

  /**
   * Get current user value
   */
  get currentUserValue(): IUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Login user
   */
  async login(credentials: ILogin): Promise<IAuthResponse> {
    try {
      let response: IAuthResponse;

      if (this.useSQLite) {
        // Use SQLite
        response = await this.sqliteAuth.login(credentials);
      } else if (this.useMockBackend) {
        // Use mock backend
        response = await this.mockBackend.login(credentials);
      } else {
        // Use real API
        response = await lastValueFrom(
          this.apiService.post<IAuthResponse>('auth/login', credentials)
        );
      }

      this.setSession(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: IRegister): Promise<IAuthResponse> {
    try {
      let response: IAuthResponse;

      if (this.useSQLite) {
        // Use SQLite
        response = await this.sqliteAuth.register(userData);
      } else if (this.useMockBackend) {
        // Use mock backend
        response = await this.mockBackend.register(userData);
      } else {
        // Use real API
        response = await lastValueFrom(
          this.apiService.post<IAuthResponse>('auth/register', userData)
        );
      }

      this.setSession(response);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const userId = this.currentUserValue?.id;

      if (this.useSQLite && userId) {
        await this.sqliteAuth.logout(userId);
      } else if (!this.useMockBackend) {
        // Call API to invalidate token on server
        await lastValueFrom(this.apiService.post('auth/logout', {}));
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<IAuthResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return null;
    }

    try {
      let response: IAuthResponse | null;

      if (this.useSQLite) {
        response = await this.sqliteAuth.refreshToken(refreshToken);
      } else if (!this.useMockBackend) {
        response = await lastValueFrom(
          this.apiService.post<IAuthResponse>('auth/refresh', { refreshToken })
        );
      } else {
        // Mock backend doesn't support refresh
        this.clearSession();
        return null;
      }

      if (response) {
        this.setSession(response);
      } else {
        this.clearSession();
      }

      return response;
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  /**
   * Get stored access token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set user session
   */
  private setSession(authResponse: IAuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));

    this.currentUserSubject.next(authResponse.user as any);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear user session
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get user from storage
   */
  private getUserFromStorage(): IUser | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if token is valid
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const isExpired = Date.now() >= payload.exp * 1000;
      return !isExpired;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token
   */
  private decodeToken(token: string): ITokenPayload {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Check token expiration periodically
   */
  private checkTokenExpiration(): void {
    setInterval(() => {
      if (!this.hasValidToken() && this.isAuthenticated) {
        this.refreshToken().catch(() => this.clearSession());
      }
    }, 60000); // Check every minute
  }
}
