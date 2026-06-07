import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
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
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

// ── Dialog Nuevo Plan ─────────────────────────────────────────────────────────
@Component({
  selector: 'app-plan-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Plan</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nombre</mat-label>
          <input matInput formControlName="nombre">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Duración (días)</mat-label>
          <input matInput type="number" formControlName="duracion_dias">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Precio (Bs.)</mat-label>
          <input matInput type="number" step="0.01" formControlName="precio">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="descripcion" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>`,
  styles: [`.dialog-form{display:flex;flex-direction:column;gap:4px;padding-top:8px;min-width:320px}.full{width:100%}`]
})
export class PlanDialogComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private ref: MatDialogRef<PlanDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      nombre:       [data?.nombre || '', Validators.required],
      duracion_dias:[data?.duracion_dias || '', [Validators.required, Validators.min(1)]],
      precio:       [data?.precio || '', [Validators.required, Validators.min(0)]],
      descripcion:  [data?.descripcion || '']
    });
  }
  save() { if (this.form.valid) this.ref.close(this.form.value); }
}

// ── Dialog Nueva Membresía ────────────────────────────────────────────────────
@Component({
  selector: 'app-membresia-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>Nueva Membresía</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Cliente</mat-label>
          <mat-select formControlName="cliente_id">
            @for (c of data.clientes; track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }} {{ c.apellido }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Plan</mat-label>
          <mat-select formControlName="plan_membresia_id">
            @for (p of data.planes; track p.id) {
              <mat-option [value]="p.id">{{ p.nombre }} — {{ p.duracion_dias }} días — Bs.{{ p.precio }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Fecha inicio</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="fecha_inicio" [min]="today">
          <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
          <mat-datepicker #dp></mat-datepicker>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Crear</button>
    </mat-dialog-actions>`,
  styles: [`.dialog-form{display:flex;flex-direction:column;gap:4px;padding-top:8px;min-width:340px}.full{width:100%}`]
})
export class MembresiaDialogComponent {
  form: FormGroup;
  today = new Date();
  constructor(private fb: FormBuilder, private ref: MatDialogRef<MembresiaDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      cliente_id:        ['', Validators.required],
      plan_membresia_id: ['', Validators.required],
      fecha_inicio:      ['', Validators.required]
    });
  }
  save() {
    if (!this.form.valid) return;
    const v = this.form.value;
    this.ref.close({ ...v, fecha_inicio: v.fecha_inicio.toISOString().split('T')[0] });
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-membresias',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatTableModule, MatPaginatorModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDialogModule, MatSnackBarModule, MatChipsModule, MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './membresias.component.html',
  styleUrl: './membresias.component.scss'
})
export class MembresiasComponent implements OnInit {
  // Planes
  planesCols = ['nombre', 'duracion_dias', 'precio', 'activo', 'acciones'];
  planes: any[] = [];
  loadingPlanes = false;

  // Membresías
  membrCols = ['cliente', 'plan', 'fecha_inicio', 'fecha_fin', 'precio_pagado', 'estado', 'acciones'];
  membresias: any[] = [];
  totalMemb = 0;
  pageMemb = 1;
  limitMemb = 10;
  loadingMemb = false;
  filtroEstado = '';
  estados = ['', 'ACTIVA', 'VENCIDA', 'CANCELADA'];

  esAdmin = false;
  clientes: any[] = [];

  constructor(private http: HttpClient, private dialog: MatDialog, private snack: MatSnackBar, private auth: AuthService) {}

  ngOnInit() {
    this.esAdmin = this.auth.hasRole('ADMIN');
    this.loadPlanes();
    this.loadMembresias();
    this.loadClientes();
  }

  loadPlanes() {
    this.loadingPlanes = true;
    this.http.get<any[]>(`${environment.apiUrl}/planes-membresia`).subscribe({
      next: data => { this.planes = data; this.loadingPlanes = false; },
      error: () => this.loadingPlanes = false
    });
  }

  loadClientes() {
    this.http.get<any>(`${environment.apiUrl}/clientes?page=1&limit=100`).subscribe({
      next: res => this.clientes = res.data
    });
  }

  loadMembresias(page = this.pageMemb) {
    this.loadingMemb = true;
    let params = new HttpParams().set('page', page).set('limit', this.limitMemb);
    if (this.filtroEstado) params = params.set('estado', this.filtroEstado);
    this.http.get<any>(`${environment.apiUrl}/membresias`, { params }).subscribe({
      next: res => { this.membresias = res.data; this.totalMemb = res.total; this.loadingMemb = false; },
      error: () => this.loadingMemb = false
    });
  }

  abrirDialogPlan(plan?: any) {
    this.dialog.open(PlanDialogComponent, { data: plan, width: '380px' }).afterClosed().subscribe(result => {
      if (!result) return;
      const req = plan
        ? this.http.patch(`${environment.apiUrl}/planes-membresia/${plan.id}`, result)
        : this.http.post(`${environment.apiUrl}/planes-membresia`, result);
      req.subscribe({ next: () => { this.snack.open('Plan guardado', 'OK', { duration: 2000 }); this.loadPlanes(); } });
    });
  }

  desactivarPlan(plan: any) {
    this.http.patch(`${environment.apiUrl}/planes-membresia/${plan.id}/desactivar`, {}).subscribe({
      next: () => { this.snack.open('Plan desactivado', 'OK', { duration: 2000 }); this.loadPlanes(); },
      error: err => this.snack.open(err.status === 409 ? 'Tiene membresías activas' : 'Error', 'OK', { duration: 3000 })
    });
  }

  abrirDialogMembresia() {
    this.dialog.open(MembresiaDialogComponent, {
      data: { clientes: this.clientes, planes: this.planes.filter(p => p.activo) },
      width: '420px'
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.http.post(`${environment.apiUrl}/membresias`, result).subscribe({
        next: () => { this.snack.open('Membresía creada', 'OK', { duration: 2000 }); this.loadMembresias(); },
        error: () => this.snack.open('Error al crear membresía', 'OK', { duration: 3000 })
      });
    });
  }

  cancelarMembresia(id: number) {
    this.http.patch(`${environment.apiUrl}/membresias/${id}/cancelar`, {}).subscribe({
      next: () => { this.snack.open('Membresía cancelada', 'OK', { duration: 2000 }); this.loadMembresias(); }
    });
  }

  onPageMemb(e: PageEvent) { this.pageMemb = e.pageIndex + 1; this.limitMemb = e.pageSize; this.loadMembresias(); }

  estadoColor(estado: string): string {
    if (estado === 'ACTIVA') return 'primary';
    if (estado === 'VENCIDA') return 'warn';
    return '';
  }
}
