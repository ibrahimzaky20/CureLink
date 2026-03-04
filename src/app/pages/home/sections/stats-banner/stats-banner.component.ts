import { Component } from '@angular/core';
import type { Stat } from '../../../../core/models/stat.model';

@Component({
  selector: 'app-stats-banner',
  imports: [],
  templateUrl: './stats-banner.component.html',
  styleUrl: './stats-banner.component.scss'
})
export class StatsBannerComponent {
  readonly stats: Stat[] = [
    { value: '50K+',  label: 'Medicines Donated',  sublabel: 'Successfully redistributed' },
    { value: '$2.5M', label: 'Value Saved',         sublabel: 'In healthcare costs' },
    { value: '15K+',  label: 'Lives Impacted',      sublabel: 'Patients helped' },
    { value: '98%',   label: 'Satisfaction Rate',   sublabel: 'From partners' }
  ];
}
