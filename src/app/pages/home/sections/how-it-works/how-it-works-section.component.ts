import { Component } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import type { Step } from '../../../../core/models/step.model';

@Component({
  selector: 'app-how-it-works-section',
  imports: [SectionHeaderComponent],
  templateUrl: './how-it-works-section.component.html',
  styleUrl: './how-it-works-section.component.scss'
})
export class HowItWorksSectionComponent {
  readonly steps: Step[] = [
    {
      number: '01',
      icon: 'fa-solid fa-list',
      title: 'List Your Medicine',
      description: 'Donors register and list their surplus, unexpired medications with complete details including expiry date and quantity.'
    },
    {
      number: '02',
      icon: 'fa-solid fa-magnifying-glass',
      title: 'Verification Process',
      description: 'Our system verifies the medication details, ensuring safety standards and regulatory compliance are met.'
    },
    {
      number: '03',
      icon: 'fa-solid fa-check-circle',
      title: 'Match with Recipients',
      description: 'Verified medicines are matched with healthcare institutions and patients who need them most.'
    },
    {
      number: '04',
      icon: 'fa-solid fa-truck',
      title: 'Safe Delivery',
      description: 'Coordinated pickup and delivery ensures medicines reach their destination safely and on time.'
    }
  ];
}
