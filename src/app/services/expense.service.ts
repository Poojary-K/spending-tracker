import { Injectable } from '@angular/core';
import { Expense, ExpenseData } from '../models/expense.model';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'spending-tracker';
const CATEGORY_KEY = 'spending-tracker-categories';

/**
 * ExpenseService manages all expense data and emits real-time updates
 * using an RxJS BehaviorSubject. Components can subscribe to changes$.
 */
@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private data: ExpenseData;

  /**
   * Emits the current ExpenseData for real-time updates.
   */
  private data$ = new BehaviorSubject<ExpenseData>(this.load());

  /**
   * List of known categories, loaded from localStorage.
   */
  private categories: string[] = this.loadCategories();

  constructor() {
    this.data = this.data$.value;
  }

  /**
   * Observable for components to subscribe to expense data changes.
   */
  get changes$() {
    return this.data$.asObservable();
  }

  private load(): ExpenseData {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : { userId: 'default', months: {} };
  }

  private saveAndEmit(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.data$.next(this.data);
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
    this.addCategory(expense.category); // Remember category
    this.saveAndEmit();
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
      this.saveAndEmit();
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

    this.saveAndEmit();
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(json: string): void {
    this.data = JSON.parse(json);
    this.saveAndEmit();
  }

  /**
   * Get all known categories (for dropdown).
   */
  getCategories(): string[] {
    return [...this.categories];
  }

  /**
   * Add a new category if not already present, and persist.
   */
  addCategory(category: string) {
    const cat = category.trim();
    if (cat && !this.categories.includes(cat)) {
      this.categories.push(cat);
      this.saveCategories();
    }
  }

  private loadCategories(): string[] {
    const raw = localStorage.getItem(CATEGORY_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveCategories() {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(this.categories));
  }
}
