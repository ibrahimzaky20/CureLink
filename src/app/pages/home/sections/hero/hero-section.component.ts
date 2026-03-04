import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss'
})
export class HeroSectionComponent {
  readonly stats = [
    { icon: 'fa-solid fa-shield-halved', label: 'Verified & Safe',  sublabel: 'Quality assured' },
    { icon: 'fa-solid fa-users',         label: '10K+ Donors',      sublabel: 'Active community' },
    { icon: 'fa-solid fa-building',      label: '500+ Partners',    sublabel: 'Healthcare facilities' }
  ];
}
