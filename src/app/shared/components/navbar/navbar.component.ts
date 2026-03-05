
import { Component, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  fragment?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NavbarComponent {
  readonly mobileOpen = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'How It Works',    route: '/', fragment: 'how-it-works' },
    { label: 'For Donors',      route: '/ForDonor', fragment: 'for-donor' },
    { label: 'For Institutions', route: '/ForInstitution', fragment: 'for-institution' },
    { label: 'About',           route: '/about' }
  ];

  toggleMobile(): void {
    this.mobileOpen.update(v => !v);
  }
}
