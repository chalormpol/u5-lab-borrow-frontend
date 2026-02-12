import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { AuthService } from './auth.service';
import { Observable, catchError, throwError } from 'rxjs';

export interface BorrowHistory {
  _id: string;
  equipment: {
    _id: string;
    itemName: string;
  };
  borrowerName: string;
  status: 'borrowed' | 'returned';
  borrowedAt: string;
  returnedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class BorrowHistoryService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private base = `${environment.apiBase}/history`;

  getAll(): Observable<BorrowHistory[]> {
    return this.http.get<BorrowHistory[]>(this.base, {
      headers: this.auth.headers(),
    });
  }

  getByEquipment(id: string): Observable<BorrowHistory[]> {
    return this.http.get<BorrowHistory[]>(`${this.base}/equipment/${id}`, {
      headers: this.auth.headers(),
    });
  }

  private err(e: HttpErrorResponse) {
    const msg =
      e.error?.message || e.message || 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    return throwError(() => new Error(msg));
  }
}
