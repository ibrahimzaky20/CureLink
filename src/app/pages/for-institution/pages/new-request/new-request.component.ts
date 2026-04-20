import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MedicationRequestService } from '../../../../core/services/medication-request/medication-request.service';

@Component({
  selector: 'app-new-request',
  imports: [ReactiveFormsModule],
  templateUrl: './new-request.component.html',
  styleUrl: './new-request.component.scss'
})
export class NewRequestComponent {
  private readonly fb     = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api    = inject(MedicationRequestService);

  files       = signal<File[]>([]);
  submitting  = signal(false);
  serverError = signal('');

  categories = [
    'Diabetic care',
    'Cardiovascular',
    'Antibiotics',
    'Pain relief',
    'Respiratory',
    'Vitamins & supplements',
    'Other',
  ];

  form = this.fb.nonNullable.group({
    medicineName: ['', Validators.required],
    quantity:     [null as number | null, [Validators.required, Validators.min(1)]],
    category:     ['', Validators.required],
  });

  fieldError(name: string): string {
    const ctrl = this.form.get(name);
    if (!ctrl || !ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return 'This field is required';
    if (ctrl.errors['min'])      return 'Must be at least 1';
    return '';
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.addFiles(Array.from(input.files ?? []));
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

  cancel() {
    this.router.navigate(['for-institution', 'my-requests']);
  }

  submit() {
    this.form.markAllAsTouched();
    this.serverError.set('');

    if (this.form.invalid) return;
    if (this.files().length === 0) {
      this.serverError.set('Please upload at least one packaging photo.');
      return;
    }

    this.submitting.set(true);
    const { medicineName, quantity, category } = this.form.getRawValue();

    this.api.createRequest({
      medicineName,
      quantity: quantity!,
      category,
      images: this.files(),
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
