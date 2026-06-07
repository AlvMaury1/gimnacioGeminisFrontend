import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RecaptchaModule } from 'ng-recaptcha';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RecaptchaModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  form: FormGroup;
  captchaToken: string | null = null;
  loading = false;
  errorMsg = '';
  hidePassword = true;
  siteKey = environment.recaptchaSiteKey;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onCaptchaResolved(token: string | null): void {
    this.captchaToken = token;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.captchaToken) {
      this.errorMsg = !this.captchaToken ? 'Completa el CAPTCHA.' : 'Completa todos los campos.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    this.auth.login({ ...this.form.value, captchaToken: this.captchaToken }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        this.captchaToken = null;
        if (err.status === 429) this.errorMsg = 'Demasiados intentos. Espera 15 minutos.';
        else if (err.status === 400) this.errorMsg = 'CAPTCHA inválido.';
        else this.errorMsg = 'Credenciales incorrectas.';
      }
    });
  }
}
