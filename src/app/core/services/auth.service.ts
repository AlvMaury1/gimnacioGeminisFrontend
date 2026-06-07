import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginPayload {
  email: string;
  password: string;
  captchaToken: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private currentUser$ = new BehaviorSubject<TokenPayload | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    const token = this.getToken();
    if (token) this.currentUser$.next(this.decodeToken(token));
  }

  login(payload: LoginPayload): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap(res => {
        sessionStorage.setItem(this.TOKEN_KEY, res.accessToken);
        this.currentUser$.next(this.decodeToken(res.accessToken));
      })
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/register`, payload);
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.currentUser$.value?.rol === role;
  }

  getCurrentUser(): TokenPayload | null {
    return this.currentUser$.value;
  }

  getCurrentUser$(): Observable<TokenPayload | null> {
    return this.currentUser$.asObservable();
  }

  private clearSession(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.currentUser$.next(null);
    this.router.navigate(['/login']);
  }

  private decodeToken(token: string): TokenPayload {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
