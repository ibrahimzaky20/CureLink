import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { MedicationRequestService } from '../../../../core/services/medication-request/medication-request.service';

@Component({
  selector: 'app-new-request',
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './new-request.component.html',
  styleUrl: './new-request.component.scss'
})
export class NewRequestComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api    = inject(MedicationRequestService);

  submitting  = signal(false);
  serverError = signal('');

  dosageForms = ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'];
  units       = ['box', 'bottle', 'strip', 'unit'];
  priorities  = ['low', 'medium', 'high', 'urgent'];

  form = this.fb.nonNullable.group({
    medicineName:   ['', [Validators.required, Validators.minLength(2)]],
    strength:       [''],
    dosageForm:     [''],
    quantityAmount: [null as number | null, [Validators.required, Validators.min(1)]],
    quantityUnit:   ['', Validators.required],
    priority:       ['medium'],
    expiresAt:      ['', Validators.required],
    notes:          [''],
  });

  get minDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }

  fieldError(name: string): string {
    const ctrl = this.form.get(name);
    if (!ctrl || !ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required'])  return 'This field is required';
    if (ctrl.errors['min'])       return 'Must be at least 1';
    if (ctrl.errors['minlength']) return 'Must be at least 2 characters';
    return '';
  }

  cancel() {
    this.router.navigate(['for-institution', 'my-requests']);
  }

  submit() {
    this.form.markAllAsTouched();
    this.serverError.set('');

    if (this.form.invalid) return;

    this.submitting.set(true);
    const v = this.form.getRawValue();

    this.api.createRequest({
      medicineName: v.medicineName,
      strength: v.strength || undefined,
      dosageForm: v.dosageForm || undefined,
      requiredQuantity: { amount: v.quantityAmount!, unit: v.quantityUnit },
      priority: v.priority || undefined,
      expiresAt: v.expiresAt,
      notes: v.notes || undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['for-institution', 'my-requests']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(err.error?.message ?? 'Something went wrong. Please try again.');
      }
    });
  }
}
