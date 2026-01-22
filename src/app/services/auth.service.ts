import { Injectable, inject, signal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
export type Role = 'staff' | 'admin';
export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: Role;
}
interface AuthResponse {
  token: string;
  user: AuthUser;
}

const STORAGE_KEY = 'u5_lab_auth_v2';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  token = signal<string | null>(null);
  user = signal<AuthUser | null>(null);

  constructor() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const p = JSON.parse(raw) as { token: string; user: AuthUser };
        this.token.set(p.token);
        this.user.set(p.user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  register(username: string, displayName: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiBase}/auth/register`, {
        username,
        displayName,
        password,
      })
      .pipe(catchError(this.err));
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiBase}/auth/login`, {
        username,
        password,
      })
      .pipe(catchError(this.err));
  }

  handleAuth(res: AuthResponse) {
    this.token.set(res.token);
    this.user.set(res.user);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: res.token, user: res.user })
    );
  }

  logout() {
    this.token.set(null);
    this.user.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  headers(): HttpHeaders {
    const t = this.token();
    return t
      ? new HttpHeaders({ Authorization: `Bearer ${t}` })
      : new HttpHeaders();
  }

  isLoggedIn() {
    return !!this.token();
  }
  isAdmin() {
    return this.user()?.role === 'admin';
  }

  private err(e: HttpErrorResponse) {
    const msg = e.error?.error?.message || e.message || 'เกิดข้อผิดพลาด';
    return throwError(() => new Error(msg));
  }
}
