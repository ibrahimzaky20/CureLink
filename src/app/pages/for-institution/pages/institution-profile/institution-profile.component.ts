import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InstitutionService, InstitutionProfile } from '../../../../core/services/institution/institution.service';
import { AuthServiceService } from '../../../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-institution-profile',
  imports: [FormsModule],
  templateUrl: './institution-profile.component.html',
  styleUrl: './institution-profile.component.scss'
})
export class InstitutionProfileComponent implements OnInit {
  private readonly api  = inject(InstitutionService);
  private readonly auth = inject(AuthServiceService);

  readonly saving   = signal(false);
  readonly errorMsg = signal('');
  readonly successMsg = signal('');

  readonly profile = signal<InstitutionProfile | null>(null);

  // Editable fields
  readonly institutionName = signal('');
  readonly address         = signal('');
  readonly contactNumber   = signal('');
  readonly logoFile        = signal<File | null>(null);
  readonly logoPreview     = signal<string>('');

  readonly isVerified  = computed(() => true);
  readonly statusLabel = computed(() => 'Verified');

  readonly licenseNumber = computed(() => this.profile()?.licenseNumber || '');
  readonly type          = computed(() => this.profile()?.type || '');

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile(): void {
    this.errorMsg.set('');
    this.api.getProfile().subscribe({
      next: (res: any) => {
        const d = res?.data ?? {};
        const p: InstitutionProfile = d.institutionData ?? d.institution ?? d.profile ?? d;
        this.profile.set(p);
        this.institutionName.set(p?.institutionName || p?.name || '');
        this.address.set(p?.address || this.formatAddress(p));
        this.contactNumber.set(p?.contactNumber || '');
        this.logoPreview.set(p?.logo || '');
      },
      error: (err) => {
        this.errorMsg.set(err?.message ?? 'Failed to load profile.');
      }
    });
  }

  private formatAddress(p: InstitutionProfile | null): string {
    const a = p?.addresses?.[0];
    if (!a) return '';
    return [a.street, a.city, a.governorate].filter(Boolean).join(', ');
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.logoFile.set(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.logoPreview.set(String(e.target?.result ?? ''));
      reader.readAsDataURL(file);
    }
  }

  saveChanges(): void {
    this.saving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');
    this.api.updateProfile({
      institutionName: this.institutionName(),
      address: this.address(),
      contactNumber: this.contactNumber(),
      logo: this.logoFile()
    }).subscribe({
      next: (res) => {
        this.profile.set(res?.data ?? this.profile());
        this.logoFile.set(null);
        this.successMsg.set(res?.message || 'Profile updated successfully.');
        this.saving.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.message ?? 'Failed to update profile.');
        this.saving.set(false);
      }
    });
  }

  initialOf(name: string | undefined): string {
    return (name ?? '').trim().charAt(0).toUpperCase() || 'I';
  }
}
