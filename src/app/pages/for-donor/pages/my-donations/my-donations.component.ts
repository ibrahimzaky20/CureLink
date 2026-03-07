import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface Donation {
  medicine: string;
  qty: string;
  date: string;
  status: 'Delivered' | 'Approved' | 'Pending';
}

@Component({
  selector: 'app-my-donations',
  imports: [NgClass, NgIf, ButtonComponent],
  templateUrl: './my-donations.component.html',
  styleUrl: './my-donations.component.scss'
})
export class MyDonationsComponent {
  donations: Donation[] = [
    { medicine: 'Amoxicillin 500mg', qty: '30 boxes', date: 'Feb 20 2026', status: 'Delivered' },
    { medicine: 'Amoxicillin 500mg', qty: '30 boxes', date: 'Feb 20 2026', status: 'Approved' },
    { medicine: 'Amoxicillin 500mg', qty: '30 boxes', date: 'Feb 20 2026', status: 'Pending' },
  ];

  getProgressStep(status: string): number {
    if (status === 'Delivered') return 3;
    if (status === 'Approved') return 2;
    return 1;
  }
}
