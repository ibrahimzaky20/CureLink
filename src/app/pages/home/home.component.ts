import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroSectionComponent } from './sections/hero/hero-section.component';
import { HowItWorksSectionComponent } from './sections/how-it-works/how-it-works-section.component';
import { StatsBannerComponent } from './sections/stats-banner/stats-banner.component';
import { FeaturesSectionComponent } from './sections/features/features-section.component';
import { ParticipantsSectionComponent } from './sections/participants/participants-section.component';
import { CtaSectionComponent } from './sections/cta/cta-section.component';

@Component({
  selector: 'app-home',
  imports: [
    NavbarComponent,
    FooterComponent,
    HeroSectionComponent,
    HowItWorksSectionComponent,
    StatsBannerComponent,
    FeaturesSectionComponent,
    ParticipantsSectionComponent,
    CtaSectionComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
