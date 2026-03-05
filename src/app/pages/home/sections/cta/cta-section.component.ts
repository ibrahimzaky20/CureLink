import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cta-section',
  imports: [RouterLink],
  templateUrl: './cta-section.component.html',
  styleUrl: './cta-section.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CtaSectionComponent {}
