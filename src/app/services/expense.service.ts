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

    // Normalize category capitalization before storing
    const normalizedExpense = { ...expense, category: this.capitalize(expense.category) };

    this.data.months[month].expenses.push(normalizedExpense);
    this.addCategory(normalizedExpense.category); // Remember category
    this.saveAndEmit();
  }

  updateExpense(updated: Expense, originalExpense?: Expense): void {
    const newMonth = updated.date.slice(0, 7);
    
    // If we have the original expense, we need to find and remove it from its original month
    if (originalExpense) {
      const originalMonth = originalExpense.date.slice(0, 7);
      const originalMonthly = this.data.months[originalMonth];
      
      if (originalMonthly) {
        // Find and remove the original expense using the ORIGINAL values
        // We need to match exactly what was stored, not what the user is updating to
        const originalIndex = originalMonthly.expenses.findIndex(e =>
          e.date === originalExpense.date &&
          e.category.toLowerCase() === originalExpense.category.toLowerCase() &&
          e.description === originalExpense.description &&
          e.amount === originalExpense.amount
        );
        
        if (originalIndex !== -1) {
          // Remove the expense from the original month
          originalMonthly.expenses.splice(originalIndex, 1);
          
          // Clean up empty month
          if (originalMonthly.expenses.length === 0) {
            delete this.data.months[originalMonth];
          }
        }
      }
    }
    
    // Ensure the new month exists
    if (!this.data.months[newMonth]) {
      this.data.months[newMonth] = { expenses: [] };
    }
    
    // Add the updated expense to the new month
    const normalized = { ...updated, category: this.capitalize(updated.category) };
    this.data.months[newMonth].expenses.push(normalized);
    this.addCategory(normalized.category);
    
    this.saveAndEmit();
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
    let cat = category.trim();
    if (!cat) return;
    cat = this.capitalize(cat);
    if (!this.categories.some(c => c.trim().toLowerCase() === cat.toLowerCase())) {
      this.categories.push(cat);
      this.saveCategories();
    }
  }

  /**
   * Rename an existing category across all expenses.
   * Updates stored category list and expense entries, then emits changes.
   */
  /** Utility: capitalize first letter, rest lower. */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  renameCategory(oldName: string, newName: string): void {
    const oldNorm = oldName.trim().toLowerCase();
    let newKey = newName.trim();
    if (!oldNorm || !newKey) return;

    // Standardize new category's capitalization (same rule used in AddExpenseComponent)
    newKey = this.capitalize(newKey);

    // 1. Update categories inside each expense (case-insensitive match)
    for (const month of Object.keys(this.data.months)) {
      const monthly = this.data.months[month];
      monthly.expenses.forEach(exp => {
        if (exp.category.trim().toLowerCase() === oldNorm) {
          exp.category = newKey;
        }
      });
    }

    // 2. Update stored categories list (remove old, ensure new present exactly once)
    this.categories = this.categories
      .filter(c => c.trim().toLowerCase() !== oldNorm)
      .filter((value, index, self) => self.findIndex(v => v.trim().toLowerCase() === value.trim().toLowerCase()) === index); // dedupe
    if (!this.categories.some(c => c.trim().toLowerCase() === newKey.toLowerCase())) {
      this.categories.push(newKey);
    }

    this.saveCategories();
    this.saveAndEmit();
  }

  /**
   * Delete a category and all associated expenses.
   */
  deleteCategory(category: string): void {
    const keyNorm = category.trim().toLowerCase();
    if (!keyNorm) return;

    // 1. Remove from categories list (case-insensitive)
    this.categories = this.categories.filter(c => c.trim().toLowerCase() !== keyNorm);

    // 2. Remove expenses belonging to this category
    for (const month of Object.keys(this.data.months)) {
      const monthly = this.data.months[month];
      monthly.expenses = monthly.expenses.filter(e => e.category.trim().toLowerCase() !== keyNorm);
      // Delete month if empty
      if (monthly.expenses.length === 0) {
        delete this.data.months[month];
      }
    }

    this.saveCategories();
    this.saveAndEmit();
  }

  private loadCategories(): string[] {
    const raw = localStorage.getItem(CATEGORY_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveCategories() {
    localStorage.setItem(CATEGORY_KEY, JSON.stringify(this.categories));
  }
}
