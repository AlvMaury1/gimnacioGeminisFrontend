import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatDividerModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  menuItems: MenuItem[] = [
    { label: 'Dashboard',         icon: 'dashboard',      route: '/dashboard',    roles: ['ADMIN', 'RECEPCIONISTA'] },
    { label: 'Clientes',          icon: 'people',         route: '/clientes',     roles: ['ADMIN', 'RECEPCIONISTA'] },
    { label: 'Membresías',        icon: 'card_membership',route: '/membresias',   roles: ['ADMIN', 'RECEPCIONISTA'] },
    { label: 'Inventario',        icon: 'inventory_2',    route: '/inventario',   roles: ['ADMIN', 'RECEPCIONISTA'] },
    { label: 'Ventas',            icon: 'shopping_cart',  route: '/ventas',       roles: ['ADMIN', 'RECEPCIONISTA'] },
    { label: 'Equipamiento',      icon: 'fitness_center', route: '/equipamiento', roles: ['ADMIN', 'RECEPCIONISTA'] },
    { label: 'Reportes',          icon: 'description',    route: '/reportes',     roles: ['ADMIN', 'RECEPCIONISTA'] },
    { label: 'Log de Acceso',     icon: 'history',        route: '/log-acceso',   roles: ['ADMIN'] },
    { label: 'Registrar Usuario', icon: 'person_add',     route: '/register',     roles: ['ADMIN'] },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  get visibleMenuItems(): MenuItem[] {
    const rol = this.auth.getCurrentUser()?.rol || '';
    return this.menuItems.filter(item => item.roles.includes(rol));
  }

  get userEmail(): string { return this.auth.getCurrentUser()?.email || ''; }
  get userRol(): string { return this.auth.getCurrentUser()?.rol || ''; }

  logout(): void { this.auth.logout(); }
}
