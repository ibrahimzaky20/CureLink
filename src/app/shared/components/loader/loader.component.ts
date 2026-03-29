import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../core/services/loader/loader.service';

@Component({
  selector: 'app-loader',
  template: `
    @if (loader.loading()) {
      <div class="loader-overlay">
        <div class="spinner"></div>
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

    .spinner {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 4px solid #E2E8F0;
      border-top-color: #2BCEB8;
      border-right-color: #39A0EA;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoaderComponent {
  protected readonly loader = inject(LoaderService);
}
