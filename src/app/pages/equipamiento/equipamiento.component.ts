import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';

// ── Dialog Equipo ─────────────────────────────────────────────────────────────
@Component({
  selector: 'app-equipo-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Equipo</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full"><mat-label>Nombre</mat-label><input matInput formControlName="nombre"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Variante / Modelo</mat-label><input matInput formControlName="variante"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Cantidad total</mat-label><input matInput type="number" min="1" formControlName="cantidad_total"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Número de serie</mat-label><input matInput formControlName="numero_serie"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Ubicación</mat-label><input matInput formControlName="ubicacion"></mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Fecha de adquisición</mat-label>
          <input matInput [matDatepicker]="dp1" formControlName="fecha_adquisicion" [max]="today">
          <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
          <mat-datepicker #dp1></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Próximo mantenimiento</mat-label>
          <input matInput [matDatepicker]="dp2" formControlName="proximo_mantenimiento">
          <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
          <mat-datepicker #dp2></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>`,
  styles: [`.dialog-form{display:flex;flex-direction:column;gap:4px;padding-top:8px;min-width:380px}.full{width:100%}`]
})
export class EquipoDialogComponent {
  form: FormGroup;
  today = new Date();
  constructor(private fb: FormBuilder, private ref: MatDialogRef<EquipoDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      nombre:                [data?.nombre || '', Validators.required],
      variante:              [data?.variante || ''],
      cantidad_total:        [data?.cantidad_total || '', [Validators.required, Validators.min(1)]],
      numero_serie:          [data?.numero_serie || ''],
      ubicacion:             [data?.ubicacion || ''],
      fecha_adquisicion:     [data?.fecha_adquisicion ? new Date(data.fecha_adquisicion) : null],
      proximo_mantenimiento: [data?.proximo_mantenimiento ? new Date(data.proximo_mantenimiento) : null]
    });
  }
  save() {
    if (!this.form.valid) return;
    const v = this.form.value;
    this.ref.close({
      ...v,
      fecha_adquisicion:     v.fecha_adquisicion?.toISOString?.()?.split('T')[0] || v.fecha_adquisicion || undefined,
      proximo_mantenimiento: v.proximo_mantenimiento?.toISOString?.()?.split('T')[0] || v.proximo_mantenimiento || undefined
    });
  }
}

// ── Dialog Movimiento ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-movimiento-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>Registrar Movimiento — {{ data.equipo?.nombre }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Tipo</mat-label>
          <mat-select formControlName="tipo">
            <mat-option value="RETIRO">Retiro / Préstamo</mat-option>
            <mat-option value="RETORNO">Retorno / Devolución</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Cantidad</mat-label>
          <input matInput type="number" min="1" formControlName="cantidad">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Motivo</mat-label>
          <textarea matInput formControlName="motivo" rows="2"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>N° Factura</mat-label>
          <input matInput formControlName="numero_factura">
        </mat-form-field>
        @if (form.get('tipo')?.value === 'RETIRO') {
          <mat-form-field appearance="outline" class="full">
            <mat-label>Fecha estimada de retorno</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="fecha_estimada_retorno" [min]="today">
            <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Registrar</button>
    </mat-dialog-actions>`,
  styles: [`.dialog-form{display:flex;flex-direction:column;gap:4px;padding-top:8px;min-width:380px}.full{width:100%}`]
})
export class MovimientoDialogComponent {
  form: FormGroup;
  today = new Date();
  constructor(private fb: FormBuilder, private ref: MatDialogRef<MovimientoDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      tipo:                   ['RETIRO', Validators.required],
      cantidad:               [1, [Validators.required, Validators.min(1)]],
      motivo:                 [''],
      numero_factura:         [''],
      fecha_estimada_retorno: ['']
    });
  }
  save() {
    if (!this.form.valid) return;
    const v = this.form.value;
    this.ref.close({
      equipo_id: this.data.equipo.id,
      tipo:      v.tipo,
      cantidad:  v.cantidad,
      motivo:    v.motivo || undefined,
      numero_factura: v.numero_factura || undefined,
      fecha_estimada_retorno: v.tipo === 'RETIRO'
        ? (v.fecha_estimada_retorno?.toISOString?.()?.split('T')[0] || v.fecha_estimada_retorno || undefined)
        : undefined
    });
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-equipamiento',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './equipamiento.component.html',
  styleUrl: './equipamiento.component.scss'
})
export class EquipamientoComponent implements OnInit {
  equiposCols = ['nombre', 'numero_serie', 'ubicacion', 'cantidad', 'estado', 'acciones'];
  movCols = ['equipo', 'tipo', 'cantidad', 'motivo', 'fecha_estimada_retorno', 'fecha'];
  equipos: any[] = [];
  movimientos: any[] = [];
  totalEquipos = 0;
  totalMov = 0;
  pageEq = 1; limitEq = 10;
  pageMov = 1; limitMov = 10;
  loadingEq = false;
  loadingMov = false;

  constructor(private http: HttpClient, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.loadEquipos(); this.loadMovimientos(); }

  loadEquipos() {
    this.loadingEq = true;
    const params = new HttpParams().set('page', this.pageEq).set('limit', this.limitEq);
    this.http.get<any>(`${environment.apiUrl}/equipamiento`, { params }).subscribe({
      next: res => { this.equipos = res.data; this.totalEquipos = res.total; this.loadingEq = false; },
      error: () => this.loadingEq = false
    });
  }

  loadMovimientos() {
    this.loadingMov = true;
    const params = new HttpParams().set('page', this.pageMov).set('limit', this.limitMov);
    this.http.get<any>(`${environment.apiUrl}/equipamiento/movimientos`, { params }).subscribe({
      next: res => { this.movimientos = res.data; this.totalMov = res.total; this.loadingMov = false; },
      error: () => this.loadingMov = false
    });
  }

  abrirEquipo(eq?: any) {
    this.dialog.open(EquipoDialogComponent, { data: eq, width: '420px' }).afterClosed().subscribe(result => {
      if (!result) return;
      const req = eq
        ? this.http.patch(`${environment.apiUrl}/equipamiento/${eq.id}`, result)
        : this.http.post(`${environment.apiUrl}/equipamiento`, result);
      req.subscribe({ next: () => { this.snack.open('Equipo guardado', 'OK', { duration: 2000 }); this.loadEquipos(); } });
    });
  }

  abrirMovimiento(equipo: any) {
    this.dialog.open(MovimientoDialogComponent, { data: { equipo }, width: '420px' }).afterClosed().subscribe(result => {
      if (!result) return;
      this.http.post(`${environment.apiUrl}/equipamiento/movimientos`, result).subscribe({
        next: () => { this.snack.open('Movimiento registrado', 'OK', { duration: 2000 }); this.loadEquipos(); this.loadMovimientos(); },
        error: () => this.snack.open('Error al registrar', 'OK', { duration: 3000 })
      });
    });
  }

  darDeBaja(eq: any) {
    this.http.patch(`${environment.apiUrl}/equipamiento/${eq.id}/baja`, {}).subscribe({
      next: () => { this.snack.open('Equipo dado de baja', 'OK', { duration: 2000 }); this.loadEquipos(); },
      error: err => this.snack.open(err.error?.message || 'Error', 'OK', { duration: 3000 })
    });
  }

  estadoColor(e: string): string {
    if (e === 'DISPONIBLE') return 'primary';
    if (e === 'EN_MANTENIMIENTO') return 'accent';
    return 'warn';
  }

  onPageEq(e: PageEvent) { this.pageEq = e.pageIndex + 1; this.limitEq = e.pageSize; this.loadEquipos(); }
  onPageMov(e: PageEvent) { this.pageMov = e.pageIndex + 1; this.limitMov = e.pageSize; this.loadMovimientos(); }
}
