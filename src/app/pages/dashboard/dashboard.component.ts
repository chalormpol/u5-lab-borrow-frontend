import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  EquipmentService,
  Equipment,
  EquipCategory,
} from '../../services/equipment.service';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline, calendarOutline, cashOutline } from 'ionicons/icons';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonToast,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    RouterLink,
    IonIcon,
  ],
})
export class DashboardComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private eqApi = inject(EquipmentService);

  constructor() {
    addIcons({
      'time-outline': timeOutline,
      'calendar-outline': calendarOutline,
      'cash-outline': cashOutline,
    });
  }

  toastOpen = false;
  toastMsg = '';

  rows: Equipment[] = [];
  private nextId = 3;

  editingId: string | null = null;

  form = this.fb.group({
    itemName: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(2)],
    }),
    category: this.fb.control<EquipCategory>('Philosophy', {
      validators: [Validators.required],
    }),
    qty: this.fb.control(1, {
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.load();
  }

  load() {
    this.eqApi.list().subscribe({
      next: (items) => (this.rows = items),
      error: (e) => this.toast(e.message),
    });
  }

  get me() {
    return this.auth.user();
  }
  get isAdmin() {
    return this.auth.isAdmin();
  }

  add() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return this.toast('ข้อมูลไม่ครบ/ไม่ถูกต้อง');
    }
    if (!this.isAdmin)
      return this.toast('เฉพาะ admin เท่านั้นที่เพิ่มรายการได้');

    const v = this.form.getRawValue();
    this.eqApi
      .create({
        itemName: v.itemName,
        category: v.category,
        qty: Number(v.qty),
      })
      .subscribe({
        next: (_) => {
          this.toast('เพิ่มอุปกรณ์สำเร็จ');
          this.form.reset({ itemName: '', category: 'Philosophy', qty: 1 });
          this.load();
        },
        error: (e) => this.toast(e.message),
      });
  }

  startEdit(row: Equipment) {
    this.editingId = row._id;
    this.form.setValue({
      itemName: row.itemName,
      category: row.category,
      qty: row.qty,
    });
  }

  saveEdit() {
    if (this.editingId === null) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return this.toast('ข้อมูลไม่ครบ/ไม่ถูกต้อง');
    }
    if (!this.isAdmin)
      return this.toast('เฉพาะ admin เท่านั้นที่แก้ไขรายการได้');

    const v = this.form.getRawValue();
    const id = this.editingId; // ตอนนี้ editingId ต้องเป็น string (ObjectId)
    this.eqApi
      .update(id, {
        itemName: v.itemName,
        category: v.category,
        qty: Number(v.qty),
      })
      .subscribe({
        next: (_) => {
          this.toast('บันทึกการแก้ไขสำเร็จ');
          this.editingId = null;
          this.form.reset({ itemName: '', category: 'Philosophy', qty: 1 });
          this.load();
        },
        error: (e) => this.toast(e.message),
      });
  }

  cancelEdit() {
    this.editingId = null;
    this.form.reset({ itemName: '', category: 'Philosophy', qty: 1 });
  }

  remove(id: string) {
    if (!this.isAdmin) return this.toast('เฉพาะ admin เท่านั้นที่ลบรายการได้');

    this.eqApi.remove(id).subscribe({
      next: (_) => {
        this.toast('ลบรายการสำเร็จ');
        this.load();
      },
      error: (e) => this.toast(e.message),
    });
  }

  // ===== จำลองยืม–คืน =====
  borrow(row: Equipment) {
    if (row.status === 'borrowed') return this.toast('รายการนี้ถูกยืมไปแล้ว');

    const defaultName = this.me?.displayName || '';
    const name = prompt('ชื่อผู้ยืม (Borrower name):', defaultName) || '';
    const borrowerName = name.trim();
    if (borrowerName.length < 2) return this.toast('กรุณาระบุชื่อผู้ยืม');

    this.eqApi.borrow(row._id, borrowerName).subscribe({
      next: (_) => {
        this.toast('ยืมอุปกรณ์สำเร็จ');
        this.load();
      },
      error: (e) => this.toast(e.message),
    });
  }

  returnEquip(row: Equipment) {
    if (row.status === 'available')
      return this.toast('รายการนี้ยังไม่ได้ถูกยืม');

    this.eqApi.returnEquip(row._id).subscribe({
      next: (_) => {
        this.toast('คืนอุปกรณ์สำเร็จ');
        this.load();
      },
      error: (e) => this.toast(e.message),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  // ✅ SUMMARY GETTERS
  get totalCount() {
    return this.rows.length;
  }

  get borrowedCount() {
    return this.rows.filter((r) => r.status === 'borrowed').length;
  }

  get availableCount() {
    return this.rows.filter((r) => r.status === 'available').length;
  }

  private toast(m: string) {
    this.toastMsg = m;
    this.toastOpen = true;
  }
}
