import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  role: 'donor' | 'institution' = 'donor';
  verificationFile: File | null = null;
  verificationFileName = '';

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.verificationFile = file;
    this.verificationFileName = file?.name ?? '';
  }

  signUp() {}
}
