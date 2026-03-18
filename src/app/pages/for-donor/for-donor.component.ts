import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-for-donor',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './for-donor.component.html',
  styleUrl: './for-donor.component.scss'
})
export class ForDonorComponent {
  private readonly auth   = inject(AuthServiceService);
  private readonly router = inject(Router);

  mobileOpen = signal(false);
  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()  { this.mobileOpen.set(false); }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => {
        // Clear local state and navigate even if the API call fails
        this.auth.clearUser();
        this.router.navigate(['/auth/login']);
      }
    });
  }
}
