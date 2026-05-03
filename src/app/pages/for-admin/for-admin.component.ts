import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthServiceService } from '../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-for-admin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './for-admin.component.html',
  styleUrl: './for-admin.component.scss'
})
export class ForAdminComponent {
  protected readonly auth = inject(AuthServiceService);
  private readonly router = inject(Router);

  userInitial = computed(() => {
    const name = this.auth.currentUser()?.firstName;
    return name ? name.charAt(0).toUpperCase() : '?';
  });

  userName = computed(() => this.auth.currentUser()?.firstName ?? 'Admin');
  isSuperadmin = computed(() => this.auth.currentUser()?.role === 'superadmin');

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
