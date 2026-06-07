import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-log-acceso',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatSortModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule
  ],
  templateUrl: './log-acceso.component.html',
  styleUrl: './log-acceso.component.scss'
})
export class LogAccesoComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['usuario', 'ip', 'evento', 'browser', 'fechaHora'];
  dataSource = new MatTableDataSource<any>([]);
  total = 0;
  loading = false;
  filterForm: FormGroup;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.filterForm = this.fb.group({ fechaDesde: [''], fechaHasta: [''] });
  }

  ngOnInit(): void { this.load(); }

  load(page = 1, limit = 10): void {
    this.loading = true;
    const { fechaDesde, fechaHasta } = this.filterForm.value;
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (fechaDesde) params = params.set('fechaDesde', fechaDesde);
    if (fechaHasta) params = params.set('fechaHasta', fechaHasta);

    this.http.get<any>(`${environment.apiUrl}/log-acceso`, { params }).subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.total = res.total;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onFilter(): void { this.load(); }
  onClear(): void { this.filterForm.reset(); this.load(); }
  onPageChange(e: any): void { this.load(e.pageIndex + 1, e.pageSize); }
}
