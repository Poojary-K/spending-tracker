import { Routes } from '@angular/router';
import { SEOGuard } from './guards/seo.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [SEOGuard]
  },
  {
    path: 'add',
    loadComponent: () => import('./components/add-expense/add-expense.component').then(m => m.AddExpenseComponent),
    canActivate: [SEOGuard]
  },
  {
    path: 'data',
    loadComponent: () => import('./components/data-import-export/data-import-export.component').then(m => m.DataImportExportComponent),
    canActivate: [SEOGuard]
  },
  {
    path: 'split',
    loadComponent: () => import('./components/split-calculator/split-calculator.component').then(m => m.SplitCalculatorComponent),
    canActivate: [SEOGuard]
  },
  {
    path: 'lending',
    loadComponent: () => import('./components/lending/lending.component').then(m => m.LendingComponent),
    canActivate: [SEOGuard]
  },
  {
    path: 'income',
    loadComponent: () => import('./components/income/income.component').then(m => m.IncomeComponent),
    canActivate: [SEOGuard]
  }
]; 