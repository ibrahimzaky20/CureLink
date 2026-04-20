import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MedicationRequestService {
  private readonly http = inject(HttpClient);
  private readonly api  = environment.apiUrl;
  private readonly opts = { withCredentials: true };

  createRequest(data: {
    medicineName: string;
    quantity: number;
    category: string;
    images: File[];
  }): Observable<any> {
    const form = new FormData();
    form.append('medicineName', data.medicineName);
    form.append('quantity', data.quantity.toString());
    form.append('category', data.category);
    for (const file of data.images) {
      form.append('images', file);
    }
    return this.http.post<any>(`${this.api}/api/v1/medication-requests`, form, this.opts);
  }
}
