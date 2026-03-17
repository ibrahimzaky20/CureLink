import { Component, signal, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent {
  email = signal('');
  otp   = signal(['', '', '', '', '', '']);

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  setEmail(value: string) { this.email.set(value); }

  onOtpInput(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    input.value = val;
    this.otp.update(arr => {
      const copy = [...arr];
      copy[index] = val;
      return copy;
    });
    if (val && index < 5) {
      this.otpInputs.toArray()[index + 1].nativeElement.focus();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      const inputs = this.otpInputs.toArray();
      if (!inputs[index].nativeElement.value && index > 0) {
        inputs[index - 1].nativeElement.focus();
      }
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, 6);
    const inputs = this.otpInputs.toArray();
    this.otp.update(() => {
      const arr = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) arr[i] = pasted[i];
      return arr;
    });
    pasted.split('').forEach((ch, i) => { if (inputs[i]) inputs[i].nativeElement.value = ch; });
    const focusIdx = Math.min(pasted.length, 5);
    inputs[focusIdx]?.nativeElement.focus();
  }

  submit() { /* hook up to API */ }
}
