import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonButton,
} from '@ionic/angular/standalone';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-users',
  templateUrl: './users.component.html',
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonButton,
  ],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  users: any[] = [];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.list().subscribe({
      next: (res) => (this.users = res),
    });
  }

  back() {
    this.router.navigateByUrl('/dashboard');
  }
}
