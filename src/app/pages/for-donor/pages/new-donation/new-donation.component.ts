import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-donation',
  imports: [],
  templateUrl: './new-donation.component.html',
  styleUrl: './new-donation.component.scss'
})
export class NewDonationComponent {
  medicineName = signal('');
  quantity     = signal('');
  expiryDate   = signal('');
  files        = signal<File[]>([]);

  medicines = ['Amoxicillin 500mg', 'Ibuprofen 400mg', 'Metformin 850mg', 'Omeprazole 20mg', 'Paracetamol 500mg', 'Lisinopril 10mg'];

  constructor(private router: Router) {}

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    const dropped = Array.from(event.dataTransfer?.files ?? []).slice(0, 3);
    this.files.set(dropped);
  }

  onDragOver(event: DragEvent) { event.preventDefault(); }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []).slice(0, 3);
    this.files.set(selected);
  }

  removeFile(index: number) {
    this.files.update(f => f.filter((_, i) => i !== index));
  }

  cancel() {
    this.router.navigate(['for-donor', 'dashboard']);
  }

  submit() {
    this.router.navigate(['for-donor', 'my-donations']);
  }
}
