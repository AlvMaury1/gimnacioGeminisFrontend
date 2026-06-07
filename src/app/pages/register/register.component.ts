import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';

const passwordMatchValidator: ValidatorFn = (group: AbstractControl) => {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirm = true;
  roles = ['ADMIN', 'RECEPCIONISTA'];

  constructor(private fb: FormBuilder, private auth: AuthService, private snack: MatSnackBar) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      rol: ['RECEPCIONISTA', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  getStrength(): 'debil' | 'intermedio' | 'fuerte' | '' {
    const pass = this.form.get('password')?.value || '';
    if (!pass) return '';
    const hasUpper = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[^A-Za-z0-9]/.test(pass);
    const isLong = pass.length >= 8;
    const score = [hasUpper, hasNumber, hasSymbol, isLong].filter(Boolean).length;
    if (score <= 2) return 'debil';
    if (score === 3) return 'intermedio';
    return 'fuerte';
  }

  getStrengthLabel(): string {
    const map: Record<string, string> = { debil: 'Débil', intermedio: 'Intermedio', fuerte: 'Fuerte', '': '' };
    return map[this.getStrength()];
  }

  onSubmit(): void {
    if (this.form.invalid || this.getStrength() === 'debil') return;
    this.loading = true;
    this.auth.register(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Usuario registrado exitosamente', 'OK', { duration: 3000 });
        this.form.reset({ rol: 'RECEPCIONISTA' });
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) this.snack.open('Este correo ya está registrado', 'OK', { duration: 3000 });
        else if (err.status === 400) this.snack.open('Contraseña débil o datos inválidos', 'OK', { duration: 3000 });
        else this.snack.open('Error al registrar usuario', 'OK', { duration: 3000 });
      }
    });
  }
}
