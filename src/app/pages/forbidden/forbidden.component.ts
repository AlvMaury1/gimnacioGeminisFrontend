import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule],
  template: `
    <div style="text-align:center; padding: 80px 20px;">
      <h1>403 — Acceso denegado</h1>
      <p>No tienes permisos para ver esta página.</p>
      <button mat-raised-button color="primary" routerLink="/dashboard">Volver al inicio</button>
    </div>
  `
})
export class ForbiddenComponent {}
