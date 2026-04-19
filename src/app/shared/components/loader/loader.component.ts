import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../core/services/loader/loader.service';

@Component({
  selector: 'app-loader',
  template: `
    @if (loader.loading()) {
      <div class="loader-overlay">
        <span class="loader-brand">CureLink</span>
      </div>
    }
  `,
  styles: [`
    .loader-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.5);
    }

    .loader-brand {
      font-family: 'Rubik', sans-serif;
      font-size: 36px;
      font-weight: 700;
      background: linear-gradient(to right, #2BCEB8 12%, #39A0EA 85%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: pulse-brand 1.4s ease-in-out infinite;
    }

    @keyframes pulse-brand {
      0%, 100% { opacity: 0.3; transform: scale(0.97); }
      50%      { opacity: 1;   transform: scale(1); }
    }
  `]
})
export class LoaderComponent {
  protected readonly loader = inject(LoaderService);
}
