import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../environments/environment';

// ── Dialog Producto ───────────────────────────────────────────────────────────
@Component({
  selector: 'app-producto-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Editar' : 'Nuevo' }} Producto</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full"><mat-label>Nombre</mat-label><input matInput formControlName="nombre"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Código de barras</mat-label><input matInput formControlName="codigo_barras"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Marca</mat-label><input matInput formControlName="marca"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Categoría</mat-label><input matInput formControlName="categoria"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Precio venta (Bs.)</mat-label><input matInput type="number" step="0.01" formControlName="precio_venta"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Stock mínimo</mat-label><input matInput type="number" formControlName="stock_minimo"></mat-form-field>
        <mat-checkbox formControlName="tiene_vencimiento">Tiene fecha de vencimiento</mat-checkbox>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>`,
  styles: [`.dialog-form{display:flex;flex-direction:column;gap:4px;padding-top:8px;min-width:340px}.full{width:100%}`]
})
export class ProductoDialogComponent {
  form: FormGroup;
  constructor(private fb: FormBuilder, private ref: MatDialogRef<ProductoDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      nombre:           [data?.nombre || '', Validators.required],
      codigo_barras:    [data?.codigo_barras || '', Validators.required],
      marca:            [data?.marca || ''],
      categoria:        [data?.categoria || ''],
      precio_venta:     [data?.precio_venta || '', [Validators.required, Validators.min(0)]],
      stock_minimo:     [data?.stock_minimo || 5, Validators.min(0)],
      tiene_vencimiento:[data?.tiene_vencimiento || false]
    });
  }
  save() { if (this.form.valid) this.ref.close(this.form.value); }
}

// ── Dialog Lote ───────────────────────────────────────────────────────────────
@Component({
  selector: 'app-lote-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>Agregar Lote — {{ data.producto?.nombre }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Número de lote</mat-label>
          <input matInput formControlName="numero_lote">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Cantidad inicial</mat-label>
          <input matInput type="number" formControlName="cantidad_inicial">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Precio costo (Bs.)</mat-label>
          <input matInput type="number" step="0.01" formControlName="precio_costo">
        </mat-form-field>
        <mat-form-field appearance="outline" class="full">
          <mat-label>Fecha de compra</mat-label>
          <input matInput [matDatepicker]="dp1" formControlName="fecha_compra" [max]="today">
          <mat-datepicker-toggle matIconSuffix [for]="dp1"></mat-datepicker-toggle>
          <mat-datepicker #dp1 startView="month"></mat-datepicker>
          @if (form.get('fecha_compra')?.hasError('matDatepickerMax')) {
            <mat-error>No puede ser una fecha futura</mat-error>
          }
        </mat-form-field>
        @if (data.producto?.tiene_vencimiento) {
          <mat-form-field appearance="outline" class="full">
            <mat-label>Fecha de vencimiento</mat-label>
            <input matInput [matDatepicker]="dp2" formControlName="fecha_vencimiento" [min]="minVencimiento">
            <mat-datepicker-toggle matIconSuffix [for]="dp2"></mat-datepicker-toggle>
            <mat-datepicker #dp2 startView="month"></mat-datepicker>
            @if (form.get('fecha_vencimiento')?.hasError('matDatepickerMin')) {
              <mat-error>Debe ser posterior a la fecha de compra</mat-error>
            }
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>`,
  styles: [`.dialog-form{display:flex;flex-direction:column;gap:4px;padding-top:8px;min-width:340px}.full{width:100%}`]
})
export class LoteDialogComponent {
  form: FormGroup;
  today = new Date();

  get minVencimiento(): Date {
    const compra = this.form.get('fecha_compra')?.value;
    return compra instanceof Date ? compra : this.today;
  }

  constructor(private fb: FormBuilder, private ref: MatDialogRef<LoteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.form = this.fb.group({
      numero_lote:       [''],
      cantidad_inicial:  ['', [Validators.required, Validators.min(1)]],
      precio_costo:      ['', [Validators.required, Validators.min(0)]],
      fecha_compra:      ['', Validators.required],
      fecha_vencimiento: [data.producto?.tiene_vencimiento ? '' : null,
                          data.producto?.tiene_vencimiento ? [Validators.required] : []]
    });
  }

  save() {
    if (!this.form.valid) return;
    const v = this.form.value;
    this.ref.close({
      ...v,
      producto_id: this.data.producto.id,
      fecha_compra: v.fecha_compra?.toISOString?.()?.split('T')[0] || v.fecha_compra,
      fecha_vencimiento: v.fecha_vencimiento?.toISOString?.()?.split('T')[0] || v.fecha_vencimiento || undefined
    });
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatDialogModule, MatSnackBarModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  // Productos
  displayedCols = ['nombre', 'codigo_barras', 'categoria', 'precio_venta', 'stock_total', 'stock_minimo', 'activo', 'acciones'];
  productos: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  searchCtrl = new FormControl('');

  // Lotes
  lotesCols = ['producto', 'numero_lote', 'cantidad_inicial', 'cantidad_disponible', 'precio_costo', 'fecha_compra', 'fecha_vencimiento', 'estado'];
  lotes: any[] = [];
  totalLotes = 0;
  pageLotes = 1;
  limitLotes = 10;
  loadingLotes = false;

  constructor(private http: HttpClient, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() {
    this.load();
    this.loadLotes();
    this.searchCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => { this.page = 1; this.load(); });
  }

  load() {
    this.loading = true;
    let params = new HttpParams().set('page', this.page).set('limit', this.limit);
    if (this.searchCtrl.value) params = params.set('search', this.searchCtrl.value);
    this.http.get<any>(`${environment.apiUrl}/inventario/productos`, { params }).subscribe({
      next: res => { this.productos = res.data; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  abrirProducto(p?: any) {
    this.dialog.open(ProductoDialogComponent, { data: p, width: '400px' }).afterClosed().subscribe(result => {
      if (!result) return;
      const req = p
        ? this.http.patch(`${environment.apiUrl}/inventario/productos/${p.id}`, result)
        : this.http.post(`${environment.apiUrl}/inventario/productos`, result);
      req.subscribe({ next: () => { this.snack.open('Producto guardado', 'OK', { duration: 2000 }); this.load(); },
        error: err => this.snack.open(err.status === 409 ? 'Código de barras duplicado' : 'Error', 'OK', { duration: 3000 }) });
    });
  }

  desactivar(p: any) {
    this.http.patch(`${environment.apiUrl}/inventario/productos/${p.id}/desactivar`, {}).subscribe({
      next: () => { this.snack.open('Producto desactivado', 'OK', { duration: 2000 }); this.load(); }
    });
  }

  abrirLote(producto: any) {
    this.dialog.open(LoteDialogComponent, { data: { producto }, width: '400px' }).afterClosed().subscribe(result => {
      if (!result) return;
      this.http.post(`${environment.apiUrl}/inventario/lotes`, result).subscribe({
        next: () => { this.snack.open('Lote agregado', 'OK', { duration: 2000 }); this.load(); },
        error: () => this.snack.open('Error al agregar lote', 'OK', { duration: 3000 })
      });
    });
  }

  loadLotes() {
    this.loadingLotes = true;
    const params = new HttpParams().set('page', this.pageLotes).set('limit', this.limitLotes);
    this.http.get<any>(`${environment.apiUrl}/inventario/lotes`, { params }).subscribe({
      next: res => { this.lotes = res.data; this.totalLotes = res.total; this.loadingLotes = false; },
      error: () => this.loadingLotes = false
    });
  }

  stockColor(p: any): string {
    return p.stock_total <= p.stock_minimo ? 'warn' : 'primary';
  }

  estadoLoteColor(estado: string): string {
    if (estado === 'ACTIVO') return 'primary';
    if (estado === 'VENCIDO') return 'warn';
    return '';
  }

  onPage(e: PageEvent) { this.page = e.pageIndex + 1; this.limit = e.pageSize; this.load(); }
  onPageLotes(e: PageEvent) { this.pageLotes = e.pageIndex + 1; this.limitLotes = e.pageSize; this.loadLotes(); }
}
