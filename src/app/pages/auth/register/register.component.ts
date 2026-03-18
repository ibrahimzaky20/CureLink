import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthServiceService } from '../../../core/services/auth/auth-service.service';

function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  return pw && cpw && pw !== cpw ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly auth   = inject(AuthServiceService);
  private readonly router = inject(Router);

  showPassword        = signal(false);
  showConfirmPassword = signal(false);
  loading             = signal(false);
  serverError         = signal('');

  form = this.fb.group({
    role:            ['donor' as 'donor' | 'institution'],
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    phone:           ['', [Validators.required, Validators.pattern(/^[0-9+\-\s]{7,15}$/)]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatch });

  get f() { return this.form.controls; }

  setRole(role: 'donor' | 'institution') {
    this.form.patchValue({ role });
  }

  fieldError(name: keyof typeof this.form.controls): string {
    const ctrl = this.f[name];
    if (!ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required'])   return 'This field is required.';
    if (ctrl.errors['minlength'])  return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['email'])      return 'Enter a valid email address.';
    if (ctrl.errors['pattern'])    return 'Enter a valid phone number.';
    return '';
  }

  get confirmError(): string {
    const ctrl = this.f['confirmPassword'];
    if (!ctrl.touched) return '';
    if (ctrl.errors?.['required']) return 'This field is required.';
    if (this.form.errors?.['mismatch']) return 'Passwords do not match.';
    return '';
  }

  signUp() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { role, firstName, lastName, email, password, phone } = this.form.value;
    this.loading.set(true);
    this.serverError.set('');

    this.auth.register({
      firstName: firstName!,
      lastName:  lastName!,
      email:     email!,
      password:  password!,
      phone:     phone!,
      role:      role as 'donor' | 'institution'
    }).subscribe({
      next: () => {
        this.auth.savePendingReg(email!, role as 'donor' | 'institution');
        this.loading.set(false);
        this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
      },
      error: err => {
        this.loading.set(false);
        console.error('Register error:', err);
        const msg = err?.error?.message
          || err?.error?.error
          || (typeof err?.error === 'string' ? err.error : null)
          || err?.message
          || `Error ${err?.status ?? 'unknown'}`;
        this.serverError.set(msg);
      }
    });
  }
}
