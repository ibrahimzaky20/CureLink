import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import type { Step } from '../../../../core/models/step.model';

@Component({
  selector: 'app-how-it-works-section',
  imports: [SectionHeaderComponent],
  templateUrl: './how-it-works-section.component.html',
  styleUrl: './how-it-works-section.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HowItWorksSectionComponent {
  readonly steps: Step[] = [
    {
      number: '01',
      icon: 'fluent-mdl2:product-list',
      title: 'List Your Medicine',
      description: 'Donors register and list their surplus, unexpired medications with complete details including expiry date and quantity.'
    },
    {
      number: '02',
      icon: 'mynaui:search',
      title: 'Verification Process',
      description: 'Our system verifies the medication details, ensuring safety standards and regulatory compliance are met.'
    },
    {
      number: '03',
      icon: 'weui:done2-outlined',
      title: 'Match with Recipients',
      description: 'Verified medicines are matched with healthcare institutions and patients who need them most.'
    },
    {
      number: '04',
      icon: 'lineicons:truck-delivery-1',
      title: 'Safe Delivery',
      description: 'Coordinated pickup and delivery ensures medicines reach their destination safely and on time.'
    }
  ];
}
