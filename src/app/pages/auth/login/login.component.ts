import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthServiceService } from '../../../core/services/auth/auth-service.service';


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
          if (res?.data?.institutionStatus === 'verified') {
            this.router.navigate(['/for-institution']);
          } else {
            this.auth.clearUser();
            this.serverError.set('Your institution is still under admin review. You will be notified once approved.');
          }
        }
      },
      error: err => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'Invalid email or password.');
      }
    });
  }
}
