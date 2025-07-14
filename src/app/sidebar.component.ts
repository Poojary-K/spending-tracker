import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  template: `
    <!-- Offcanvas for mobile, fixed for desktop -->
    <div [class.offcanvas-backdrop]="open && isMobile" (click)="onBackdropClick($event)" *ngIf="open && isMobile"></div>
    <nav [class.sidebar-fixed]="!isMobile" [class.offcanvas-sidebar]="isMobile" [class.show]="open" tabindex="-1">
      <div class="sidebar-content">
        <button *ngIf="isMobile" class="btn btn-link text-end w-100 mb-2" (click)="close.emit()">
          <i class="bi bi-x-lg"></i>
        </button>
        <ul class="nav flex-column">
          <li class="nav-item mb-2">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" (click)="close.emit()">
              <i class="bi bi-speedometer2 me-2"></i> Dashboard
            </a>
          </li>
          <li class="nav-item mb-2">
            <a class="nav-link" routerLink="/add" routerLinkActive="active" (click)="close.emit()">
              <i class="bi bi-plus-circle me-2"></i> Add Expense
            </a>
          </li>
          <li class="nav-item mb-2">
            <a class="nav-link" routerLink="/data" routerLinkActive="active" (click)="close.emit()">
              <i class="bi bi-upload me-2"></i> Data Import/Export
            </a>
          </li>
          <li class="nav-item mb-2">
            <a class="nav-link" routerLink="/split" routerLinkActive="active" (click)="close.emit()">
              <i class="bi bi-people-fill me-2"></i> Split Calculator
            </a>
          </li>
        </ul>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar-fixed {
      min-width: 200px;
      max-width: 220px;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1030;
      border-right: 1px solid var(--border);
      background: var(--background);
      transition: left 0.3s;
    }
    .offcanvas-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 80vw;
      max-width: 260px;
      height: 100vh;
      background: var(--background);
      z-index: 1050;
      border-right: 1px solid var(--border);
      transform: translateX(-100%);
      transition: transform 0.3s;
      box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    }
    .offcanvas-sidebar.show {
      transform: translateX(0);
    }
    .offcanvas-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.3);
      z-index: 1049;
    }
    .sidebar-content {
      padding: 1rem 0.75rem;
    }
    .nav-link.active {
      font-weight: bold;
      color: var(--primary) !important;
    }
    @media (min-width: 768px) {
      .offcanvas-sidebar, .offcanvas-backdrop {
        display: none !important;
      }
      .sidebar-fixed {
        display: block !important;
      }
    }
    @media (max-width: 767.98px) {
      .sidebar-fixed {
        display: none !important;
      }
      .offcanvas-sidebar {
        display: block !important;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  get isMobile() {
    return window.innerWidth < 768;
  }

  onBackdropClick(event: MouseEvent) {
    event.stopPropagation();
    this.close.emit();
  }
} 