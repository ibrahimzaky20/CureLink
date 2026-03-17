import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Medication {
  id: number;
  name: string;
  form: string;
  category: string;
  quantity: number;
  unit: string;
  expires: string;
  verified: boolean;
}

@Component({
  selector: 'app-browse',
  imports: [FormsModule],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.scss'
})
export class BrowseComponent {
  searchQuery = signal('');

  medications: Medication[] = [
    { id: 1, name: 'Amoxicillin 500mg', form: 'Capsules', category: 'Antibiotic', quantity: 50, unit: 'Units', expires: 'Oct 2026', verified: true },
    { id: 2, name: 'Ibuprofen 400mg',   form: 'Tablets',  category: 'Analgesic',  quantity: 120, unit: 'Units', expires: 'Dec 2026', verified: true },
    { id: 3, name: 'Metformin 850mg',   form: 'Tablets',  category: 'Antidiabetic', quantity: 80, unit: 'Units', expires: 'Mar 2027', verified: true },
    { id: 4, name: 'Omeprazole 20mg',   form: 'Capsules', category: 'Antacid',    quantity: 60, unit: 'Units', expires: 'Jun 2027', verified: true },
    { id: 5, name: 'Paracetamol 500mg', form: 'Tablets',  category: 'Analgesic',  quantity: 200, unit: 'Units', expires: 'Sep 2026', verified: true },
    { id: 6, name: 'Cetirizine 10mg',   form: 'Tablets',  category: 'Antihistamine', quantity: 30, unit: 'Units', expires: 'Jan 2027', verified: true },
  ];

  get filtered() {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.medications;
    return this.medications.filter(m =>
      m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  }

  requestItem(med: Medication) {
    alert(`Request sent for: ${med.name}`);
  }
}
