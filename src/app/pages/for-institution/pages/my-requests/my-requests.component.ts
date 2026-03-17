import { Component, signal, computed } from '@angular/core';

type Status = 'Approved' | 'Delivered' | 'Received' | 'Pending';
type Filter = 'All' | Status;

interface MedRequest {
  id: string;
  medication: string;
  quantity: string;
  requestedOn: string;
  status: Status;
}

@Component({
  selector: 'app-my-requests',
  imports: [],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss'
})
export class MyRequestsComponent {
  activeFilter = signal<Filter>('All');
  filters: Filter[] = ['All', 'Pending', 'Approved', 'Delivered', 'Received'];

  requests: MedRequest[] = [
    { id: 'REQ-2034', medication: 'Metformin 850mg',   quantity: '100 Tablets', requestedOn: 'Today, 10:22 AM', status: 'Approved'  },
    { id: 'REQ-2021', medication: 'Amoxicillin 500mg', quantity: '50 Capsules', requestedOn: 'Oct 14, 2023',    status: 'Received'  },
    { id: 'REQ-1850', medication: 'Lisinopril 10mg',   quantity: '30 Tablets',  requestedOn: 'Oct 10, 2023',    status: 'Delivered' },
    { id: 'REQ-1994', medication: 'Insulin Glargine',  quantity: '5 Vials',     requestedOn: 'Sep 28, 2023',    status: 'Pending'   },
  ];

  stats = computed(() => ({
    total:     this.requests.length + 38,
    approved:  this.requests.filter(r => r.status === 'Approved').length  + 17,
    delivered: this.requests.filter(r => r.status === 'Delivered').length + 6,
    received:  this.requests.filter(r => r.status === 'Received').length  + 16,
  }));

  filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'All' ? this.requests : this.requests.filter(r => r.status === f);
  });

  setFilter(f: Filter) { this.activeFilter.set(f); }
}
