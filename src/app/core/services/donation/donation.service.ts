import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  createDonation(data: {
    medicineName: string;
    expiryDate: string;
    conditionNotes: string;
    images: File[];
  }): Observable<any> {
    const form = new FormData();
    form.append('medicineName', data.medicineName);
    form.append('expiryDate', data.expiryDate);
    form.append('conditionNotes', data.conditionNotes);
    for (const file of data.images) {
      form.append('images', file);
    }
    return this.http.post<any>(`${this.api}/api/v1/donations`, form, this.opts);
  }
}
