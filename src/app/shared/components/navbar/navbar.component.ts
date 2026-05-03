
import { Component, signal, computed, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServiceService } from '../../../core/services/auth/auth-service.service';

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
  private readonly auth   = inject(AuthServiceService);
  private readonly router = inject(Router);

  readonly mobileOpen = signal(false);
  readonly menuOpen   = signal(false);

  readonly user = this.auth.currentUser;

  readonly navItems = computed<NavItem[]>(() => {
    const base: NavItem[] = [
      { label: 'How It Works', route: '/', fragment: 'how-it-works' }
    ];
    const u = this.user();
    if (!u) {
      base.push({ label: 'Donate Now', route: '/auth/register' });
    } else if (u.role === 'donor') {
      base.push({ label: 'Manage Your Donations', route: '/for-donor' });
    } else if (u.role === 'institution') {
      base.push({ label: 'Manage Donations', route: '/for-institution' });
    } else if (u.role === 'admin' ) {
      base.push({ label: 'Manage Donations', route: '/for-admin' });
    } else if ( u.role === 'superadmin') {
      base.push({ label: 'Manage Platform', route: '/for-admin' });
    }
    base.push({ label: 'About', route: '/about' });
    return base;
  });

  readonly initial = computed(() => {
    const f = this.user()?.firstName ?? '';
    return f.charAt(0).toUpperCase();
  });

  toggleMobile(): void { this.mobileOpen.update(v => !v); }
  toggleMenu(): void { this.menuOpen.update(v => !v); }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => { this.menuOpen.set(false); this.router.navigate(['/']); },
      error: () => { this.auth.clearUser(); this.menuOpen.set(false); this.router.navigate(['/']); }
    });
  }
}
