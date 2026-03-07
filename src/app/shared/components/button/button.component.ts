import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  @Input() label = '';
  @Input() variant: 'primary' | 'outline' = 'primary';
  @Input() size: 'md' | 'sm' = 'md';
  @Input() showPlusIcon = false;
  @Input() link: string | null = null;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Output() clicked = new EventEmitter<void>();

  get classes(): string {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-[8px] font-semibold font-[Roboto] cursor-pointer border-none transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

    const variantClasses: Record<string, string> = {
      primary: 'bg-gradient-to-r from-[#2BCEB8] from-[12%] to-[#39a0ea] to-[85%] text-white',
      outline: 'bg-transparent text-[#0D9488] border border-[#0D9488]',
    };

    const sizeClasses: Record<string, string> = {
      md: 'h-[56px] px-6 text-sm',
      sm: 'h-[34px] px-[14px] text-xs',
    };

    return `${base} ${variantClasses[this.variant]} ${sizeClasses[this.size]}`;
  }
}
