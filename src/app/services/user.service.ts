import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  list() {
    return this.http.get<any[]>(`${environment.apiBase}/users`, {
      headers: this.auth.headers(),
    });
  }
}
