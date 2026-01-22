import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from './auth.service';

export type EquipStatus = 'available' | 'borrowed';
export type EquipCategory = 'Computer' | 'Network' | 'Electronics' | 'Other';
export interface Equipment {
  _id: string;
  itemName: string;
  category: EquipCategory;
  qty: number;
  status: EquipStatus;
  borrowerName: string;
  borrowedAt: string | null;
}
@Injectable({ providedIn: 'root' })
export class EquipmentService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  list() {
    return this.http
      .get<Equipment[]>(`${environment.apiBase}/equipments`, {
        headers: this.auth.headers(),
      })
      .pipe(catchError(this.err));
  }

  create(data: { itemName: string; category: EquipCategory; qty: number }) {
    return this.http
      .post<Equipment>(`${environment.apiBase}/equipments`, data, {
        headers: this.auth.headers(),
      })
      .pipe(catchError(this.err));
  }

  update(
    id: string,
    data: { itemName: string; category: EquipCategory; qty: number }
  ) {
    return this.http
      .put<Equipment>(`${environment.apiBase}/equipments/${id}`, data, {
        headers: this.auth.headers(),
      })
      .pipe(catchError(this.err));
  }

  remove(id: string) {
    return this.http
      .delete<{ ok: boolean }>(`${environment.apiBase}/equipments/${id}`, {
        headers: this.auth.headers(),
      })
      .pipe(catchError(this.err));
  }

  borrow(id: string, borrowerName: string) {
    return this.http
      .post<Equipment>(
        `${environment.apiBase}/equipments/${id}/borrow`,
        { borrowerName },
        { headers: this.auth.headers() }
      )
      .pipe(catchError(this.err));
  }

  returnEquip(id: string) {
    return this.http
      .post<Equipment>(
        `${environment.apiBase}/equipments/${id}/return`,
        {},
        { headers: this.auth.headers() }
      )
      .pipe(catchError(this.err));
  }

  private err(e: HttpErrorResponse) {
    const msg =
      e.error?.error?.message || e.message || 'เกิดข้อผิดพลาด (equipments)';
    return throwError(() => new Error(msg));
  }
}
