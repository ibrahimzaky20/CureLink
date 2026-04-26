import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthServiceService } from '../../../core/services/auth/auth-service.service';

type ResetStep = 'email' | 'otp' | 'password';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthServiceService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  showPassword = signal(false);
  loading      = signal(false);
  serverError  = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  // ── Forgot Password State ──
  showReset       = signal(false);
  resetStep       = signal<ResetStep>('email');
  resetLoading    = signal(false);
  resetError      = signal('');
  resetSuccess    = signal('');
  showNewPassword = signal(false);

  resetEmailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  resetOtpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  resetPasswordForm = this.fb.group({
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('pending') === 'institution') {
      this.serverError.set('Your institution is pending admin approval. You will be notified once verified.');
    }
  }

  get f() { return this.form.controls; }

  fieldError(name: 'email' | 'password'): string {
    const ctrl = this.f[name];
    if (!ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['email'])    return 'Enter a valid email address.';
    return '';
  }

  login() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');

    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        const user = res?.data?.user;

        if (!user) {
          this.serverError.set('Login failed. Please try again.');
          return;
        }

        if (user.role === 'superadmin') {
          this.router.navigate(['/admin']);
          return;
        }

        if (user.role === 'donor') {
          if (!user.isVerified) {
            this.auth.savePendingReg(user.email, user.role);
            this.router.navigate(['/auth/verify-email'], { queryParams: { email: user.email } });
          } else {
            this.router.navigate(['/for-donor']);
          }
          return;
        }

        if (user.role === 'institution') {
          if (user.isVerified) {
            this.router.navigate(['/for-institution']);
          } else {
            this.serverError.set('Your institution is pending admin approval. You will be notified once verified.');
          }
        }
      },
      error: err => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'Invalid email or password.');
      }
    });
  }

  // ── Forgot Password Flow ──
  openReset() {
    this.showReset.set(true);
    this.resetStep.set('email');
    this.resetError.set('');
    this.resetSuccess.set('');
    this.resetEmailForm.reset({ email: this.form.value.email ?? '' });
    this.resetOtpForm.reset();
    this.resetPasswordForm.reset();
  }

  closeReset() {
    this.showReset.set(false);
  }

  resetFieldError(form: 'email' | 'otp' | 'password', field: string): string {
    let ctrl: any;
    if (form === 'email')    ctrl = this.resetEmailForm.get(field);
    else if (form === 'otp') ctrl = this.resetOtpForm.get(field);
    else                     ctrl = this.resetPasswordForm.get(field);

    if (!ctrl?.touched || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required.';
    if (ctrl.errors['email'])     return 'Enter a valid email address.';
    if (ctrl.errors['minlength']) return field === 'otp' ? 'Code must be 6 digits.' : 'Password must be at least 8 characters.';
    return '';
  }

  sendResetCode() {
    this.resetEmailForm.markAllAsTouched();
    if (this.resetEmailForm.invalid) return;

    this.resetLoading.set(true);
    this.resetError.set('');

    const email = this.resetEmailForm.value.email!;
    this.auth.forgotPassword(email).subscribe({
      next: () => {
        this.resetLoading.set(false);
        this.resetStep.set('otp');
      },
      error: err => {
        this.resetLoading.set(false);
        this.resetError.set(err?.error?.message ?? 'Failed to send reset code. Please try again.');
      }
    });
  }

  verifyResetOtp() {
    this.resetOtpForm.markAllAsTouched();
    if (this.resetOtpForm.invalid) return;

    this.resetLoading.set(true);
    this.resetError.set('');

    const email = this.resetEmailForm.value.email!;
    const otp   = this.resetOtpForm.value.otp!;

    this.auth.verifyResetOtp(email, otp).subscribe({
      next: () => {
        this.resetLoading.set(false);
        this.resetStep.set('password');
      },
      error: err => {
        this.resetLoading.set(false);
        this.resetError.set(err?.error?.message ?? 'Invalid code. Please try again.');
      }
    });
  }

  submitNewPassword() {
    this.resetPasswordForm.markAllAsTouched();
    if (this.resetPasswordForm.invalid) return;

    const { password, confirmPassword } = this.resetPasswordForm.value;
    if (password !== confirmPassword) {
      this.resetError.set('Passwords do not match.');
      return;
    }

    this.resetLoading.set(true);
    this.resetError.set('');

    const email = this.resetEmailForm.value.email!;
    const otp   = this.resetOtpForm.value.otp!;

    this.auth.resetPassword(email, otp, password!).subscribe({
      next: () => {
        this.resetLoading.set(false);
        this.resetSuccess.set('Password reset successfully! You can now sign in.');
        setTimeout(() => this.closeReset(), 2500);
      },
      error: err => {
        this.resetLoading.set(false);
        this.resetError.set(err?.error?.message ?? 'Failed to reset password. Please try again.');
      }
    });
  }

  sanitizeOtp(input: HTMLInputElement) {
    input.value = input.value.replace(/\D/g, '').slice(0, 6);
    this.resetOtpForm.get('otp')!.setValue(input.value);
  }
}
