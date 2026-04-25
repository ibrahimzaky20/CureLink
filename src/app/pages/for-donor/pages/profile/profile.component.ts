import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UserProfileService, UserProfile, Session } from '../../../../core/services/user-profile/user-profile.service';
import { AuthServiceService } from '../../../../core/services/auth/auth-service.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, DatePipe, ButtonComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly profileService = inject(UserProfileService);
  private readonly auth = inject(AuthServiceService);
  private readonly fb = inject(FormBuilder);

  profile = signal<UserProfile | null>(null);
  sessions = signal<Session[]>([]);
  loading = signal(true);
  avatarPreview = signal<string | null>(null);
  selectedAvatarFile = signal<File | null>(null);

  editingProfile = signal(false);
  profileSaving = signal(false);
  profileSuccess = signal('');
  profileError = signal('');

  avatarUploading = signal(false);
  avatarError = signal('');

  passwordSaving = signal(false);
  passwordSuccess = signal('');
  passwordError = signal('');

  sessionsLoading = signal(false);
  revokingAll = signal(false);
  revokingId = signal<string | null>(null);

  profileForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^01[0125]\d{8}$/)]]
  });

  passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  ngOnInit() {
    this.loadProfile();
    this.loadSessions();
  }

  loadProfile() {
    this.loading.set(true);
    this.profileService.getProfile().subscribe({
      next: (res) => {
        const user = res?.data?.user ?? res?.data;
        if (user?.avatar) {
          const url = user.avatar?.url ?? user.avatar?.path ?? user.avatar;
          user.avatar = typeof url === 'string' && !url.startsWith('http')
            ? 'https://curelink-api.io' + (url.startsWith('/') ? '' : '/') + url
            : url;
        }
        this.profile.set(user);
        this.profileForm.patchValue({
          email: user?.email ?? '',
          phone: user?.phone ?? ''
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadSessions() {
    this.sessionsLoading.set(true);
    this.profileService.getSessions().subscribe({
      next: (res) => {
        this.sessions.set(res?.data?.sessions ?? res?.data ?? []);
        this.sessionsLoading.set(false);
      },
      error: () => this.sessionsLoading.set(false)
    });
  }

  startEditing() {
    this.editingProfile.set(true);
    this.profileSuccess.set('');
    this.profileError.set('');
  }

  cancelEditing() {
    this.editingProfile.set(false);
    const p = this.profile();
    if (p) {
      this.profileForm.patchValue({ email: p.email, phone: p.phone });
    }
    this.profileError.set('');
  }

  saveProfile() {
    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid) return;

    this.profileSaving.set(true);
    this.profileError.set('');
    this.profileSuccess.set('');

    const { email, phone } = this.profileForm.value;
    this.profileService.updateProfile({ email: email!, phone: phone! }).subscribe({
      next: (res) => {
        const user = res?.data?.user ?? res?.data;
        if (user) {
          this.profile.set(user);
          this.auth.saveUser({
            ...this.auth.currentUser()!,
            email: user.email
          });
        }
        this.profileSaving.set(false);
        this.editingProfile.set(false);
        this.profileSuccess.set('Profile updated successfully');
      },
      error: (err) => {
        this.profileSaving.set(false);
        this.profileError.set(err.error?.message ?? 'Failed to update profile');
      }
    });
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedAvatarFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  uploadAvatar() {
    const file = this.selectedAvatarFile();
    if (!file) return;

    this.avatarUploading.set(true);
    this.avatarError.set('');
    this.profileService.uploadAvatar(file).subscribe({
      next: () => {
        this.avatarUploading.set(false);
        this.selectedAvatarFile.set(null);
        this.avatarPreview.set(null);
        this.loadProfile();
      },
      error: (err) => {
        this.avatarUploading.set(false);
        this.avatarError.set(err.error?.message ?? 'Failed to upload avatar');
      }
    });
  }

  cancelAvatarUpload() {
    this.selectedAvatarFile.set(null);
    this.avatarPreview.set(null);
    this.avatarError.set('');
  }

  deleteAvatar() {
    this.avatarUploading.set(true);
    this.avatarError.set('');
    this.profileService.deleteAvatar().subscribe({
      next: () => {
        this.avatarUploading.set(false);
        this.loadProfile();
      },
      error: (err) => {
        this.avatarUploading.set(false);
        this.avatarError.set(err.error?.message ?? 'Failed to delete avatar');
      }
    });
  }

  changePassword() {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.invalid) return;

    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordError.set('Passwords do not match');
      return;
    }

    this.passwordSaving.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set('');

    this.profileService.changePassword(oldPassword!, newPassword!).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordSuccess.set('Password changed successfully');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordSaving.set(false);
        this.passwordError.set(err.error?.message ?? 'Failed to change password');
      }
    });
  }

  revokeAllSessions() {
    this.revokingAll.set(true);
    this.profileService.revokeAllSessions().subscribe({
      next: () => {
        this.revokingAll.set(false);
        this.loadSessions();
      },
      error: () => this.revokingAll.set(false)
    });
  }

  revokeSession(id: string) {
    this.revokingId.set(id);
    this.profileService.revokeSession(id).subscribe({
      next: () => {
        this.revokingId.set(null);
        this.sessions.update(s => s.filter(session => session._id !== id));
      },
      error: () => this.revokingId.set(null)
    });
  }

  profileFieldError(field: string): string {
    const ctrl = this.profileForm.get(field);
    if (!ctrl || !ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return `${field} is required`;
    if (ctrl.errors['email']) return 'Invalid email address';
    if (ctrl.errors['pattern']) return 'Invalid phone number';
    return '';
  }

  passwordFieldError(field: string): string {
    const ctrl = this.passwordForm.get(field);
    if (!ctrl || !ctrl.touched || !ctrl.errors) return '';
    if (ctrl.errors['required']) return `${field === 'oldPassword' ? 'Current password' : field === 'newPassword' ? 'New password' : 'Confirm password'} is required`;
    if (ctrl.errors['minlength']) return 'Password must be at least 8 characters';
    return '';
  }

  getUserInitial(): string {
    const p = this.profile();
    return p?.firstName ? p.firstName.charAt(0).toUpperCase() : '?';
  }
}
