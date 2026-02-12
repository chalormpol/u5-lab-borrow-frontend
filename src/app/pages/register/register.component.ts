import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonToast,
    RouterLink,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class RegisterComponent {
  private fb = inject(NonNullableFormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  toastOpen = false;
  toastMsg = '';

  form = this.fb.group({
    username: this.fb.control('', [Validators.required]),
    displayName: this.fb.control('', [Validators.required]),
    password: this.fb.control('', [
      Validators.required,
      Validators.minLength(4),
    ]),
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return this.toast('กรุณากรอกข้อมูลให้ครบถ้วน');
    }

    const { username, displayName, password } = this.form.getRawValue();

    this.auth.register(username, displayName, password).subscribe({
      next: (res) => {
        this.auth.handleAuth(res);
        this.toast('สมัครสมาชิกสำเร็จ');
        this.router.navigateByUrl('/dashboard');
      },
      error: (e) => this.toast(e.message),
    });
  }

  private toast(m: string) {
    this.toastMsg = m;
    this.toastOpen = true;
  }
}
