import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

export interface UrgentNeed {
  name: string;
  units: string;
  urgency: 'Critical' | 'High' | 'Moderate';
}

@Component({
  selector: 'app-urgent-needs',
  imports: [NgClass, ButtonComponent],
  templateUrl: './urgent-needs.component.html',
  styleUrl: './urgent-needs.component.scss'
})
export class UrgentNeedsComponent {
  urgentNeeds: UrgentNeed[] = [
    { name: 'Insulin Glargine', units: '100 units needed', urgency: 'Critical' },
    { name: 'Salbutamol Inhaler', units: '50 units needed', urgency: 'High' },
    { name: 'Insulin Glargine', units: '200 units needed', urgency: 'Moderate' },
  ];
}
