import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./components/add-expense/add-expense.component').then(m => m.AddExpenseComponent)
  },
  {
    path: 'data',
    loadComponent: () => import('./components/data-import-export.component').then(m => m.DataImportExportComponent)
  }
]; 