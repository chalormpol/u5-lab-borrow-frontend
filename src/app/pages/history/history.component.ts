import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BorrowHistoryService,
  BorrowHistory,
} from '../../services/borrow-history.service';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonButton,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonButton,
    RouterLink,
  ],
})
export class HistoryComponent {
  private historyService = inject(BorrowHistoryService);

  rows = signal<BorrowHistory[]>([]);

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.historyService.getAll().subscribe((res) => this.rows.set(res));
  }
}
