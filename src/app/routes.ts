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
    loadComponent: () => import('./components/data-import-export/data-import-export.component').then(m => m.DataImportExportComponent)
  },
  {
    path: 'split',
    loadComponent: () => import('./components/split-calculator/split-calculator.component').then(m => m.SplitCalculatorComponent)
  },
  {
    path: 'lending',
    loadComponent: () => import('./components/lending/lending.component').then(m => m.LendingComponent)
  }
]; 