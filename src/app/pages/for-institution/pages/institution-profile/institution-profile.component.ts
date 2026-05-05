import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { InstitutionService, InstitutionProfile } from '../../../../core/services/institution/institution.service';
import { AuthServiceService } from '../../../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-institution-profile',
  imports: [FormsModule, TitleCasePipe],
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
  readonly documents = signal<Array<{ _id: string; file: string; type: string; createdAt: string }>>([]);
  readonly allDocsUploaded = signal(false);
  readonly taxCardFile      = signal<File | null>(null);
  readonly licenseFile      = signal<File | null>(null);
  readonly uploading        = signal(false);
  readonly uploadError      = signal('');
  readonly uploadSuccess    = signal('');

  // Editable fields
  readonly institutionName = signal('');
  readonly address         = signal('');
  readonly contactNumber   = signal('');
  readonly logoFile        = signal<File | null>(null);
  readonly logoPreview     = signal<string>('');

  readonly verificationStatus = computed(() => {
    return this.profile()?.verificationStatus ?? this.auth.currentUser()?.institution?.verificationStatus ?? 'pending';
  });
  readonly isVerified  = computed(() => this.verificationStatus() === 'verified');
  readonly statusLabel = computed(() => {
    const s = this.verificationStatus();
    if (s === 'verified') return 'Verified';
    if (s === 'rejected') return 'Rejected';
    return 'Pending Verification';
  });

  readonly licenseNumber = computed(() => this.profile()?.licenseNumber || '');
  readonly type          = computed(() => this.profile()?.type || '');

  ngOnInit(): void {
    this.fetchProfile();
    this.fetchDocuments();
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

  fetchDocuments(): void {
    this.api.getDocuments().subscribe({
      next: (res: any) => {
        this.documents.set(res?.data?.institutionDocs ?? []);
        this.allDocsUploaded.set(res?.data?.allIsUploaded ?? false);
      },
      error: () => {}
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

  onTaxCardSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.taxCardFile.set(input.files?.[0] ?? null);
    this.uploadError.set('');
    this.uploadSuccess.set('');
  }

  onLicenseSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.licenseFile.set(input.files?.[0] ?? null);
    this.uploadError.set('');
    this.uploadSuccess.set('');
  }

  uploadDocuments(): void {
    const taxCard = this.taxCardFile();
    const license = this.licenseFile();
    if (!taxCard && !license) return;

    this.uploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set('');

    this.api.uploadDocuments(taxCard, license).subscribe({
      next: (res) => {
        this.uploading.set(false);
        this.uploadSuccess.set(res?.message || 'Documents uploaded successfully.');
        this.taxCardFile.set(null);
        this.licenseFile.set(null);
        this.fetchDocuments();
      },
      error: (err) => {
        this.uploading.set(false);
        this.uploadError.set(err?.error?.message ?? 'Failed to upload documents.');
      }
    });
  }

  initialOf(name: string | undefined): string {
    return (name ?? '').trim().charAt(0).toUpperCase() || 'I';
  }
}
