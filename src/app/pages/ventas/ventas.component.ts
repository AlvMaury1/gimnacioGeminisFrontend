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
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../environments/environment';

// ── Dialog Nueva Venta ────────────────────────────────────────────────────────
@Component({
  selector: 'app-venta-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatIconModule,
    MatTableModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>Nueva Venta</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Cliente (opcional)</mat-label>
          <mat-select formControlName="cliente_id">
            <mat-option [value]="null">Sin cliente</mat-option>
            @for (c of data.clientes; track c.id) {
              <mat-option [value]="c.id">{{ c.nombre }} {{ c.apellido }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Tipo de pago</mat-label>
          <mat-select formControlName="tipo_pago">
            <mat-option value="EFECTIVO">Efectivo</mat-option>
            <mat-option value="QR">QR</mat-option>
            <mat-option value="TRANSFERENCIA">Transferencia</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-divider style="margin: 8px 0"></mat-divider>
        <p style="margin: 4px 0 8px; font-weight: 500;">Productos</p>

        <!-- Selector de producto para agregar -->
        <div class="add-item-row">
          <mat-form-field appearance="outline" style="flex:1">
            <mat-label>Producto</mat-label>
            <mat-select [formControl]="productoSelCtrl">
              @for (p of data.productos; track p.id) {
                <mat-option [value]="p">{{ p.nombre }} — Bs.{{ p.precio_venta }} (stock: {{ p.stock_total }})</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="width: 80px">
            <mat-label>Cant.</mat-label>
            <input matInput type="number" min="1" [formControl]="cantidadCtrl">
          </mat-form-field>
          <button mat-icon-button color="primary" type="button" (click)="agregarItem()" [disabled]="!productoSelCtrl.value">
            <mat-icon>add_circle</mat-icon>
          </button>
        </div>

        <!-- Carrito -->
        @if (items.length > 0) {
          <table mat-table [dataSource]="items" class="carrito-table">
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Producto</th>
              <td mat-cell *matCellDef="let i">{{ i.nombre }}</td>
            </ng-container>
            <ng-container matColumnDef="cantidad">
              <th mat-header-cell *matHeaderCellDef>Cant.</th>
              <td mat-cell *matCellDef="let i">{{ i.cantidad }}</td>
            </ng-container>
            <ng-container matColumnDef="precio">
              <th mat-header-cell *matHeaderCellDef>Precio</th>
              <td mat-cell *matCellDef="let i">Bs. {{ (i.precio_venta * i.cantidad).toFixed(2) }}</td>
            </ng-container>
            <ng-container matColumnDef="quitar">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let i; let idx = index">
                <button mat-icon-button color="warn" type="button" (click)="quitarItem(idx)"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="carritoCol"></tr>
            <tr mat-row *matRowDef="let row; columns: carritoCol;"></tr>
          </table>
          <p class="total-line">Total: <strong>Bs. {{ total().toFixed(2) }}</strong></p>
        }
        @if (items.length === 0) {
          <p class="empty-cart">Agrega al menos un producto</p>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || items.length === 0" (click)="save()">
        Registrar Venta
      </button>
    </mat-dialog-actions>`,
  styles: [`
    .dialog-form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; min-width: 460px; }
    .full { width: 100%; }
    .add-item-row { display: flex; gap: 8px; align-items: center; }
    .carrito-table { width: 100%; margin-top: 4px; }
    .total-line { text-align: right; margin: 8px 0 0; font-size: 15px; }
    .empty-cart { color: #888; text-align: center; margin: 8px 0; }
  `]
})
export class VentaDialogComponent {
  form: FormGroup;
  items: any[] = [];
  carritoCol = ['nombre', 'cantidad', 'precio', 'quitar'];
  productoSelCtrl = new FormControl(null);
  cantidadCtrl = new FormControl(1);

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<VentaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      cliente_id: [null],
      tipo_pago: ['EFECTIVO', Validators.required]
    });
  }

  agregarItem() {
    const p = this.productoSelCtrl.value as any;
    if (!p) return;
    const cant = Number(this.cantidadCtrl.value) || 1;
    const existing = this.items.find(i => i.producto_id === p.id);
    if (existing) {
      existing.cantidad += cant;
    } else {
      this.items = [...this.items, { producto_id: p.id, nombre: p.nombre, precio_venta: p.precio_venta, cantidad: cant }];
    }
    this.productoSelCtrl.reset();
    this.cantidadCtrl.setValue(1);
  }

  quitarItem(idx: number) { this.items = this.items.filter((_, i) => i !== idx); }

  total() { return this.items.reduce((s, i) => s + i.precio_venta * i.cantidad, 0); }

  save() {
    if (this.form.invalid || this.items.length === 0) return;
    const { cliente_id, tipo_pago } = this.form.value;
    this.ref.close({
      cliente_id: cliente_id || undefined,
      tipo_pago,
      items: this.items.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }))
    });
  }
}

// ── Main Component ────────────────────────────────────────────────────────────
@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatTooltipModule, MatProgressSpinnerModule
  ],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss'
})
export class VentasComponent implements OnInit {
  displayedCols = ['id', 'cliente', 'fecha', 'total', 'tipo_pago', 'items'];
  ventas: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  clientes: any[] = [];
  productos: any[] = [];

  constructor(private http: HttpClient, private dialog: MatDialog, private snack: MatSnackBar) {}

  ngOnInit() { this.load(); this.loadClientes(); this.loadProductos(); }

  load() {
    this.loading = true;
    const params = new HttpParams().set('page', this.page).set('limit', this.limit);
    this.http.get<any>(`${environment.apiUrl}/ventas`, { params }).subscribe({
      next: res => { this.ventas = res.data; this.total = res.total; this.loading = false; },
      error: () => this.loading = false
    });
  }

  loadClientes() {
    this.http.get<any>(`${environment.apiUrl}/clientes?page=1&limit=100`).subscribe({
      next: res => this.clientes = res.data
    });
  }

  loadProductos() {
    this.http.get<any>(`${environment.apiUrl}/inventario/productos?page=1&limit=100`).subscribe({
      next: res => this.productos = (res.data as any[]).filter((p: any) => p.activo && p.stock_total > 0)
    });
  }

  abrirVenta() {
    this.dialog.open(VentaDialogComponent, {
      data: { clientes: this.clientes, productos: this.productos },
      width: '540px'
    }).afterClosed().subscribe(result => {
      if (!result) return;
      this.http.post(`${environment.apiUrl}/ventas`, result).subscribe({
        next: () => { this.snack.open('Venta registrada', 'OK', { duration: 2000 }); this.load(); this.loadProductos(); },
        error: err => this.snack.open(err.error?.message || 'Error al registrar venta', 'OK', { duration: 3000 })
      });
    });
  }

  onPage(e: PageEvent) { this.page = e.pageIndex + 1; this.limit = e.pageSize; this.load(); }
}
