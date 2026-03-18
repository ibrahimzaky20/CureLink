import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthServiceService } from '../../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  private readonly auth   = inject(AuthServiceService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  email        = signal('');
  otpValue     = signal('');
  emailTouched = signal(false);
  otpTouched   = signal(false);
  loading      = signal(false);
  serverError  = signal('');
  resendMsg    = signal('');

  emailError = computed(() => {
    if (!this.emailTouched()) return '';
    if (!this.email()) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email())) return 'Enter a valid email address.';
    return '';
  });

  otpError = computed(() => {
    if (!this.otpTouched()) return '';
    if (!this.otpValue()) return 'Verification code is required.';
    if (this.otpValue().length < 6) return 'Code must be 6 digits.';
    return '';
  });

  ngOnInit() {
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.email.set(emailParam);
      this.emailTouched.set(true);
    }
  }

  setEmail(value: string) {
    this.email.set(value);
    this.emailTouched.set(true);
  }

  setOtp(input: HTMLInputElement) {
    const clean = input.value.replace(/\D/g, '').slice(0, 6);
    input.value = clean;
    this.otpValue.set(clean);
    this.otpTouched.set(true);
  }

  submit() {
    this.emailTouched.set(true);
    this.otpTouched.set(true);
    if (this.emailError() || this.otpError()) return;

    this.loading.set(true);
    this.serverError.set('');

    this.auth.verifyEmail(this.email(), this.otpValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const pending = this.auth.getPendingReg();
        const role = pending?.role ?? this.auth.currentUser()?.role;
        this.auth.clearPendingReg();

        if (role === 'institution') {
          this.router.navigate(['/auth/register-institution']);
        } else {
          this.router.navigate(['/for-donor']);
        }
      },
      error: err => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'Verification failed. Please check the code and try again.');
      }
    });
  }

  resend() {
    if (!this.email()) return;
    this.resendMsg.set('');
    this.auth.resendVerification(this.email()).subscribe({
      next: () => this.resendMsg.set('A new code has been sent to your email.'),
      error: err => this.serverError.set(err?.error?.message ?? 'Failed to resend code.')
    });
  }
}
