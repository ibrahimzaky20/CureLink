import { Component } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import type { Feature } from '../../../../core/models/feature.model';

@Component({
  selector: 'app-features-section',
  imports: [SectionHeaderComponent],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss'
})
export class FeaturesSectionComponent {
  readonly features: Feature[] = [
    {
      icon: 'fa-solid fa-shield-halved',
      title: 'Quality Verification',
      description: 'Every donation undergoes rigorous verification to ensure safety and efficacy standards are met.'
    },
    {
      icon: 'fa-regular fa-clock',
      title: 'Expiry Tracking',
      description: 'Smart tracking system monitors expiration dates and prioritizes medicines approaching expiry.'
    },
    {
      icon: 'fa-solid fa-location-dot',
      title: 'Location Matching',
      description: 'Intelligent matching connects donors with nearby institutions for efficient distribution.'
    },
    {
      icon: 'fa-regular fa-file-lines',
      title: 'Digital Documentation',
      description: 'Complete digital trail for regulatory compliance and transparent donation tracking.'
    },
    {
      icon: 'fa-regular fa-bell',
      title: 'Real-time Notifications',
      description: 'Stay updated with instant alerts on donation status, matches, and delivery updates.'
    },
    {
      icon: 'fa-solid fa-chart-bar',
      title: 'Impact Analytics',
      description: 'Comprehensive dashboards showing your donation impact and community contribution.'
    }
  ];
}
