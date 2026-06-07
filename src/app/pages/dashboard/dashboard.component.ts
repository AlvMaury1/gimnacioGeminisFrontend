import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('hbarChart') hbarChartRef!: ElementRef<HTMLCanvasElement>;

  kpis = { clientesActivos: 0, membresiasActivas: 0, ventasMes: 0, equiposMantenimiento: 0 };
  loading = true;
  esAdmin = false;
  private charts: Chart[] = [];

  constructor(private http: HttpClient, private auth: AuthService) {}

  ngOnInit(): void {
    this.esAdmin = this.auth.hasRole('ADMIN');
    if (this.esAdmin) this.loadStats();
    else this.loading = false;
  }

  loadStats(): void {
    this.http.get<any>(`${environment.apiUrl}/dashboard/stats`).subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.loading = false;
        setTimeout(() => this.buildCharts(data), 0);
      },
      error: () => { this.loading = false; }
    });
  }

  buildCharts(data: any): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const meses = data.membresiasPorMes.map((d: any) => d.mes);
    const cantMem = data.membresiasPorMes.map((d: any) => d.cantidad);

    this.charts.push(new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: { labels: meses, datasets: [{ label: 'Membresías nuevas', data: cantMem, backgroundColor: '#3f51b5' }] },
      options: { responsive: true, plugins: { legend: { position: 'top' } } }
    }));

    const planes = data.clientesPorPlan.map((d: any) => d.plan);
    const cantPlanes = data.clientesPorPlan.map((d: any) => d.cantidad);
    this.charts.push(new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: { labels: planes, datasets: [{ data: cantPlanes, backgroundColor: ['#3f51b5','#f44336','#4caf50','#ff9800','#9c27b0'] }] },
      options: { responsive: true }
    }));

    const mesesIngresos = data.ingresosPorMes.map((d: any) => d.mes);
    const ingresos = data.ingresosPorMes.map((d: any) => d.ingresos);
    this.charts.push(new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: { labels: mesesIngresos, datasets: [{ label: 'Ingresos (Bs)', data: ingresos, borderColor: '#4caf50', fill: false, tension: 0.3 }] },
      options: { responsive: true }
    }));

    const productos = data.topProductos.map((d: any) => d.producto);
    const cantProd = data.topProductos.map((d: any) => d.cantidad);
    this.charts.push(new Chart(this.hbarChartRef.nativeElement, {
      type: 'bar',
      data: { labels: productos, datasets: [{ label: 'Unidades vendidas', data: cantProd, backgroundColor: '#ff9800' }] },
      options: { responsive: true, indexAxis: 'y' }
    }));
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }
}
