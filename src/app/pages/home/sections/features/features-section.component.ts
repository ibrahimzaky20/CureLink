import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SectionHeaderComponent } from '../../../../shared/components/section-header/section-header.component';
import type { Feature } from '../../../../core/models/feature.model';

@Component({
  selector: 'app-features-section',
  imports: [SectionHeaderComponent],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FeaturesSectionComponent {
  readonly features: Feature[] = [
    {
      icon: 'uiw:safety',
      title: 'Quality Verification',
      description: 'Every donation undergoes rigorous verification to ensure safety and efficacy standards are met.'
    },
    {
      icon: 'formkit:time',
      title: 'Expiry Tracking',
      description: 'Smart tracking system monitors expiration dates and prioritizes medicines approaching expiry.'
    },
    {
      icon: 'weui:location-outlined',
      title: 'Location Matching',
      description: 'Intelligent matching connects donors with nearby institutions for efficient distribution.'
    },
    {
      icon: 'system-uicons:document',
      title: 'Digital Documentation',
      description: 'Complete digital trail for regulatory compliance and transparent donation tracking.'
    },
    {
      icon: 'clarity:notification-line',
      title: 'Real-time Notifications',
      description: 'Stay updated with instant alerts on donation status, matches, and delivery updates.'
    },
    {
      icon: 'uil:analytics',
      title: 'Impact Analytics',
      description: 'Comprehensive dashboards showing your donation impact and community contribution.'
    }
  ];
}
