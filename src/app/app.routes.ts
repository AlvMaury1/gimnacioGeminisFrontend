import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clientes',     loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent) },
      { path: 'membresias',   loadComponent: () => import('./pages/membresias/membresias.component').then(m => m.MembresiasComponent) },
      { path: 'inventario',   loadComponent: () => import('./pages/inventario/inventario.component').then(m => m.InventarioComponent) },
      { path: 'ventas',       loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent) },
      { path: 'equipamiento', loadComponent: () => import('./pages/equipamiento/equipamiento.component').then(m => m.EquipamientoComponent) },
      { path: 'reportes',     loadComponent: () => import('./pages/reportes/reportes.component').then(m => m.ReportesComponent) },
      {
        path: 'log-acceso',
        loadComponent: () => import('./pages/log-acceso/log-acceso.component').then(m => m.LogAccesoComponent),
        canActivate: [roleGuard], data: { role: 'ADMIN' }
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
        canActivate: [roleGuard], data: { role: 'ADMIN' }
      },
      { path: 'forbidden', loadComponent: () => import('./pages/forbidden/forbidden.component').then(m => m.ForbiddenComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
