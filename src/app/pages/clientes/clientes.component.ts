import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClienteDialogComponent } from './cliente-dialog/cliente-dialog.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatChipsModule, MatTooltipModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  displayedColumns = ['nombre', 'apellido', 'email', 'telefono', 'estado', 'acciones'];
  clientes: any[] = [];
  total = 0;
  page = 1;
  limit = 10;
  loading = false;
  esAdmin = false;
  searchCtrl = new FormControl('');

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.esAdmin = this.auth.hasRole('ADMIN');
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => { this.page = 1; this.load(); });
  }

  load(): void {
    this.loading = true;
    let params = new HttpParams()
      .set('page', this.page)
      .set('limit', this.limit);
    if (this.searchCtrl.value) params = params.set('search', this.searchCtrl.value);

    this.http.get<any>(`${environment.apiUrl}/clientes`, { params }).subscribe({
      next: (res) => { this.clientes = res.data; this.total = res.total; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openDialog(cliente?: any): void {
    const ref = this.dialog.open(ClienteDialogComponent, { data: cliente, width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const req = cliente
        ? this.http.patch(`${environment.apiUrl}/clientes/${cliente.id}`, result)
        : this.http.post(`${environment.apiUrl}/clientes`, result);
      req.subscribe({
        next: () => { this.snack.open(cliente ? 'Cliente actualizado' : 'Cliente creado', 'OK', { duration: 3000 }); this.load(); },
        error: (err) => { this.snack.open(err.status === 409 ? 'Email ya registrado' : 'Error al guardar', 'OK', { duration: 3000 }); }
      });
    });
  }

  toggleEstado(cliente: any): void {
    const url = cliente.deletedAt
      ? `${environment.apiUrl}/clientes/${cliente.id}/restaurar`
      : `${environment.apiUrl}/clientes/${cliente.id}/eliminar`;
    this.http.patch(url, {}).subscribe({
      next: () => { this.snack.open(cliente.deletedAt ? 'Cliente reactivado' : 'Cliente desactivado', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snack.open('Error al cambiar estado', 'OK', { duration: 3000 })
    });
  }

  onPageChange(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.limit = e.pageSize;
    this.load();
  }
}
