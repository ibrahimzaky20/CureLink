import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import type { Participant } from '../../../../core/models/participant.model';

@Component({
  selector: 'app-participants-section',
  imports: [RouterLink, SectionHeaderComponent],
  templateUrl: './participants-section.component.html',
  styleUrl: './participants-section.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ParticipantsSectionComponent {
  readonly participants: Participant[] = [
    {
      icon: 'solar:heart-linear',
      subtitle: 'Individuals & Organizations',
      title: 'For Donors',
      description: "Turn your surplus medications into life-saving resources. Whether you're an individual with unused prescriptions or a pharmaceutical company with excess inventory, your donations make a difference.",
      features: [
        'Easy online registration and listing',
        'Pickup coordination assistance',
        'Tax deduction documentation',
        'Impact tracking dashboard'
      ],
      buttonText: 'Start Donating →',
      buttonRoute: '/auth/register'
    },
    {
      icon: 'solar:buildings-2-linear',
      subtitle: 'Hospitals, Clinics & Charities',
      title: 'For Institutions',
      description: 'Access verified, quality medications for your patients. Join our network of healthcare providers committed to extending care to underserved communities.',
      features: [
        'Verified medication quality',
        'Priority matching for urgent needs',
        'Compliance documentation',
        'Regular supply notifications'
      ],
      buttonText: 'Request Medicine →',
      buttonRoute: '/auth/register'
    },
    {
      icon: 'material-symbols:security',
      subtitle: 'Quality & Compliance',
      title: 'For Administrators',
      description: 'Our dedicated team ensures every donation meets the highest safety standards. Comprehensive verification, regulatory compliance, and quality assurance at every step.',
      features: [
        'Multi-layer verification process',
        'Regulatory compliance tools',
        'Real-time monitoring dashboard',
        'Audit trail & reporting'
      ],
      buttonText: 'Learn More →',
      buttonRoute: '/platform'
    }
  ];
}
