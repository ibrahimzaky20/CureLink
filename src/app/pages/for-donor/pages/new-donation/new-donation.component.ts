import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DonationService } from '../../../../core/services/donation/donation.service';

@Component({
  selector: 'app-new-donation',
  imports: [ReactiveFormsModule],
  templateUrl: './new-donation.component.html',
  styleUrl: './new-donation.component.scss'
})
export class NewDonationComponent {
  private readonly fb       = inject(FormBuilder);
  private readonly router   = inject(Router);
  private readonly donation = inject(DonationService);

  files      = signal<File[]>([]);
  submitting = signal(false);
  serverError = signal('');

  form = this.fb.nonNullable.group({
    medicineName:   ['', Validators.required],
    expiryDate:     ['', Validators.required],
    conditionNotes: [''],
  });

  fieldError(name: string): string {
    const ctrl = this.form.get(name);
    if (!ctrl || !ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required';
    return '';
  }

  // ── File handling ──
  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer?.files ?? []);
    this.addFiles(dropped);
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []);
    this.addFiles(selected);
    input.value = '';
  }

  private addFiles(newFiles: File[]) {
    const current = this.files();
    const remaining = 3 - current.length;
    if (remaining <= 0) return;
    this.files.set([...current, ...newFiles.slice(0, remaining)]);
  }

  removeFile(index: number) {
    this.files.update(f => f.filter((_, i) => i !== index));
  }

  // ── Actions ──
  cancel() {
    this.router.navigate(['for-donor', 'dashboard']);
  }

  submit() {
    this.form.markAllAsTouched();
    this.serverError.set('');

    if (this.form.invalid) return;
    if (this.files().length === 0) {
      this.serverError.set('Please upload at least one photo of the medication.');
      return;
    }

    this.submitting.set(true);
    const { medicineName, expiryDate, conditionNotes } = this.form.getRawValue();

    this.donation.createDonation({
      medicineName,
      expiryDate,
      conditionNotes,
      images: this.files(),
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['for-donor', 'my-donations']);
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(err.error?.message ?? 'Something went wrong. Please try again.');
      }
    });
  }
}
