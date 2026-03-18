import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-for-institution',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './for-institution.component.html',
  styleUrl: './for-institution.component.scss'
})
export class ForInstitutionComponent {
  private readonly auth   = inject(AuthServiceService);
  private readonly router = inject(Router);

  mobileOpen = signal(false);
  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()  { this.mobileOpen.set(false); }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        this.auth.clearUser();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
