import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface Donation {
  medicine: string;
  qty: string;
  date: string;
  status: 'Delivered' | 'Approved' | 'Pending';
}

export interface UrgentNeed {
  name: string;
  units: string;
  urgency: 'Critical' | 'High' | 'Moderate';
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgClass, NgIf, ButtonComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  donations: Donation[] = [
    { medicine: 'Amoxicillin 500mg', qty: '30 boxes', date: 'Feb 20 2026', status: 'Delivered' },
    { medicine: 'Amoxicillin 500mg', qty: '30 boxes', date: 'Feb 20 2026', status: 'Approved' },
    { medicine: 'Amoxicillin 500mg', qty: '30 boxes', date: 'Feb 20 2026', status: 'Pending' },
  ];

  urgentNeeds: UrgentNeed[] = [
    { name: 'Insulin Glargine', units: '100 units needed', urgency: 'Critical' },
    { name: 'Salbutamol Inhaler', units: '50 units needed', urgency: 'High' },
    { name: 'Insulin Glargine', units: '200 units needed', urgency: 'Moderate' },
  ];

  getProgressStep(status: string): number {
    if (status === 'Delivered') return 3;
    if (status === 'Approved') return 2;
    return 1;
  }
}
