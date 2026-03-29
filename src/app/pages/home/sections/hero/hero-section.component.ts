import { Component, CUSTOM_ELEMENTS_SCHEMA, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthServiceService } from '../../../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeroSectionComponent {
  private readonly auth = inject(AuthServiceService);

  donateLink = computed(() =>
    this.auth.isLoggedIn() ? '/for-donor/new-donation' : '/auth/register'
  );

  readonly stats = [
    { icon: 'material-symbols:security', label: 'Verified & Safe',   sublabel: 'Quality assured' },
    { icon: 'lucide:users',              label: '10K+ Donors',       sublabel: 'Active community' },
    { icon: 'solar:buildings-2-linear',  label: '500+ Partners',     sublabel: 'Healthcare facilities' }
  ];
}
