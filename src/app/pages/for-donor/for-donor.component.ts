import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-for-donor',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './for-donor.component.html',
  styleUrl: './for-donor.component.scss'
})
export class ForDonorComponent {
  mobileOpen = signal(false);
  toggleMobile() { this.mobileOpen.update(v => !v); }
  closeMobile()  { this.mobileOpen.set(false); }
}
