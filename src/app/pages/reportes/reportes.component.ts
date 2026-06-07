import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

const dateRangeValidator: ValidatorFn = (group: AbstractControl) => {
  const desde = group.get('fechaDesde')?.value;
  const hasta = group.get('fechaHasta')?.value;
  if (desde && hasta && new Date(desde) > new Date(hasta)) {
    return { dateRangeInvalid: true };
  }
  return null;
};

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {
  membresiaForm: FormGroup;
  ventasForm: FormGroup;
  logForm: FormGroup;
  loadingMap: Record<string, boolean> = {};
  estados = ['ACTIVA', 'VENCIDA', 'CANCELADA'];

  constructor(private http: HttpClient, private fb: FormBuilder, private snack: MatSnackBar) {
    this.membresiaForm = this.fb.group({ fechaDesde: [null], fechaHasta: [null], estado: [''] }, { validators: dateRangeValidator });
    this.ventasForm    = this.fb.group({ fechaDesde: [null], fechaHasta: [null] }, { validators: dateRangeValidator });
    this.logForm       = this.fb.group({ fechaDesde: [null], fechaHasta: [null] }, { validators: dateRangeValidator });
  }

  download(endpoint: string, filename: string, params: Record<string, string> = {}): void {
    this.loadingMap[filename] = true;
    const queryParams = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const url = `${environment.apiUrl}${endpoint}${queryParams ? '?' + queryParams : ''}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        this.loadingMap[filename] = false;
      },
      error: () => {
        this.loadingMap[filename] = false;
        this.snack.open('Error al generar el reporte', 'OK', { duration: 3000 });
      }
    });
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  descargarMembresias(): void {
    if (this.membresiaForm.hasError('dateRangeInvalid')) return;
    const v = this.membresiaForm.value;
    this.download('/reportes/membresias', `membresias_${this.hoy()}.pdf`, {
      fechaDesde: this.formatDate(v.fechaDesde),
      fechaHasta: this.formatDate(v.fechaHasta),
      estado: v.estado || ''
    });
  }

  descargarVentas(): void {
    if (this.ventasForm.hasError('dateRangeInvalid')) return;
    const v = this.ventasForm.value;
    this.download('/reportes/ventas', `ventas_${this.hoy()}.pdf`, {
      fechaDesde: this.formatDate(v.fechaDesde),
      fechaHasta: this.formatDate(v.fechaHasta)
    });
  }

  descargarInventario(): void {
    this.download('/reportes/inventario', `inventario_${this.hoy()}.pdf`);
  }

  descargarLog(): void {
    if (this.logForm.hasError('dateRangeInvalid')) return;
    const v = this.logForm.value;
    this.download('/reportes/log-acceso', `log_acceso_${this.hoy()}.pdf`, {
      fechaDesde: this.formatDate(v.fechaDesde),
      fechaHasta: this.formatDate(v.fechaHasta)
    });
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }
}
