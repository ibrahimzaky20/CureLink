import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-institution-profile',
  imports: [],
  templateUrl: './institution-profile.component.html',
  styleUrl: './institution-profile.component.scss'
})
export class InstitutionProfileComponent {
  name    = signal('St. Jude Free Clinic');
  type    = signal('Free Clinic');
  license = signal('MED-99201-XYZ');
  address = signal('142 Medical District Blvd');
  contact = signal('Dr. Emily Chen');
  email   = signal('admin@stjudeclinic.org');

  documents = [
    { name: 'Medical_License.pdf',   verified: true },
    { name: 'Tax_Exempt_Status.pdf', verified: true },
  ];

  set(field: 'name' | 'type' | 'license' | 'address' | 'contact' | 'email', value: string) {
    this[field].set(value);
  }

  saveChanges() {
    alert('Changes saved!');
  }
}
