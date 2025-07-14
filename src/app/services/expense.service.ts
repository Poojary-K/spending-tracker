import { Injectable } from '@angular/core';
import { Expense, ExpenseData } from '../models/expense.model';

const STORAGE_KEY = 'spending-tracker';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private data: ExpenseData;

  constructor() {
    this.data = this.load();
  }

  private load(): ExpenseData {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : { userId: 'default', months: {} };
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  getExpenses(month: string): Expense[] {
    return this.data.months[month]?.expenses || [];
  }

  getAllMonths(): string[] {
    return Object.keys(this.data.months).sort().reverse();
  }

  addExpense(expense: Expense): void {
    const month = expense.date.slice(0, 7);
    if (!this.data.months[month]) {
      this.data.months[month] = { expenses: [] };
    }
    this.data.months[month].expenses.push(expense);
    this.save();
  }

  updateExpense(updated: Expense): void {
    const month = updated.date.slice(0, 7);
    const monthly = this.data.months[month];
    if (!monthly) return;

    const index = monthly.expenses.findIndex(e =>
      e.date === updated.date &&
      e.category.toLowerCase() === updated.category.toLowerCase() &&
      e.description === updated.description &&
      e.amount === updated.amount
    );

    if (index !== -1) {
      monthly.expenses[index] = { ...updated };
      this.save();
    }
  }

  deleteExpense(target: Expense): void {
    const month = target.date.slice(0, 7);
    const monthly = this.data.months[month];
    if (!monthly) return;

    monthly.expenses = monthly.expenses.filter(e =>
      !(
        e.date === target.date &&
        e.category.toLowerCase() === target.category.toLowerCase() &&
        e.description === target.description &&
        e.amount === target.amount
      )
    );

    // Clean up empty month
    if (monthly.expenses.length === 0) {
      delete this.data.months[month];
    }

    this.save();
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(json: string): void {
    this.data = JSON.parse(json);
    this.save();
  }
}
