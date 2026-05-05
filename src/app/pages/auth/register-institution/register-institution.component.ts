import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthServiceService } from '../../../core/services/auth/auth-service.service';
import { InstitutionService } from '../../../core/services/institution/institution.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-register-institution',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-institution.component.html',
  styleUrl: './register-institution.component.scss'
})
export class RegisterInstitutionComponent {
  private readonly fb   = inject(FormBuilder);
  private readonly auth = inject(AuthServiceService);
  private readonly instApi = inject(InstitutionService);

  logoFileName     = signal('');
  documentFileName = signal('');
  logoFile         = signal<File | null>(null);
  documentFile     = signal<File | null>(null);
  loading          = signal(false);
  serverError      = signal('');
  pendingMessage   = signal('');

  form = this.fb.group({
    name:          ['', Validators.required],
    type:          ['', Validators.required],
    licenseNumber: ['', Validators.required],
    governorate:   ['', Validators.required],
    city:          ['', Validators.required],
    street:        ['', Validators.required],
    description:   ['']
  });

  get f() { return this.form.controls; }

  fieldError(name: keyof typeof this.form.controls): string {
    const ctrl = this.f[name];
    if (!ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    return '';
  }

  onLogoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.logoFile.set(file);
    this.logoFileName.set(file?.name ?? '');
  }

  onDocumentChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.documentFile.set(file);
    this.documentFileName.set(file?.name ?? '');
  }

  signUp() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, type, licenseNumber, governorate, city, street, description } = this.form.value;
    this.loading.set(true);
    this.serverError.set('');

    // Step 1: Register institution (name, type, licenseNumber, description, logo, addresses)
    this.auth.registerInstitution(
      name!,
      type!,
      licenseNumber!,
      description ?? '',
      governorate!,
      city!,
      street!,
      this.logoFile()
    ).pipe(
      // Step 2: Upload verification document if provided
      switchMap(() => {
        const doc = this.documentFile();
        if (doc) return this.instApi.uploadDocuments(doc, null);
        return [null];
      })
    ).subscribe({
      next: () => {
        this.loading.set(false);
        this.pendingMessage.set(
          'Your institution registration has been submitted successfully. ' +
          'Our team will review your details and notify you once your account is approved.'
        );
      },
      error: err => {
        this.loading.set(false);
        const msg = err?.error?.message
          || err?.error?.error
          || err?.message
          || 'Registration failed. Please try again.';
        this.serverError.set(msg);
      }
    });
  }
}
