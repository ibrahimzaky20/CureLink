import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-for-institution',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './for-institution.component.html',
  styleUrl: './for-institution.component.scss'
})
export class ForInstitutionComponent {
  mobileOpen = signal(false);
  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()  { this.mobileOpen.set(false); }
}
