/**
 * ExpenseListComponent subscribes to ExpenseService.changes$ for real-time updates.
 * No manual refresh is needed after add/edit/delete/import.
 */
import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { SharedModule } from '../../shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  templateUrl: './expense-list.component.html',
  imports: [SharedModule]
})
export class ExpenseListComponent implements OnInit, OnChanges, OnDestroy {
  @Input() month = new Date().toISOString().slice(0, 7);
  groupedExpenses: { [category: string]: Expense[] } = {};
  editing: Expense | null = null;
  originalCopy: Expense | null = null;
  private sub?: Subscription;

  constructor(public service: ExpenseService) {}

  ngOnInit() {
    // Subscribe to real-time changes
    this.sub = this.service.changes$.subscribe(() => this.groupExpenses());
    this.groupExpenses();
  }

  ngOnChanges() {
    this.groupExpenses();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  groupExpenses() {
    const rawExpenses = this.service.getExpenses(this.month);
    this.groupedExpenses = {};
    for (const expense of rawExpenses) {
      const key = expense.category.trim().toLowerCase();
      if (!this.groupedExpenses[key]) {
        this.groupedExpenses[key] = [];
      }
      this.groupedExpenses[key].push(expense);
    }
  }

  getCategories(): string[] {
    return Object.keys(this.groupedExpenses);
  }

  getCategoryTotal(category: string): number {
    return Math.round(this.groupedExpenses[category].reduce((sum, e) => sum + e.amount, 0) * 100) / 100;
  }

  capitalize(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  formatDate(iso: string): string {
    const [yyyy, mm, dd] = iso.split('-');
    return `${dd}-${mm}-${yyyy}`;
  }

  startEdit(expense: Expense) {
    this.editing = expense;
    this.originalCopy = { ...expense };
  }

  cancelEdit() {
    if (this.editing && this.originalCopy) {
      Object.assign(this.editing, this.originalCopy);
    }
    this.editing = null;
    this.originalCopy = null;
  }

  saveEdit() {
    if (this.editing) {
      this.service.updateExpense(this.editing);
      this.editing = null;
      // No need to call groupExpenses; will update via subscription
    }
  }

  confirmDelete(expense: Expense) {
    const confirmMsg = `Are you sure you want to delete: 9${expense.amount} for "${expense.description}" on ${this.formatDate(expense.date)}?`;
    if (confirm(confirmMsg)) {
      this.deleteExpense(expense);
    }
  }

  deleteExpense(expense: Expense) {
    this.service.deleteExpense(expense);
    // No need to call groupExpenses; will update via subscription
  }

  /**
   * Prompt user to rename a category.
   */
  renameCategoryPrompt(category: string) {
    const displayName = this.capitalize(category);
    const newName = prompt(`Rename category "${displayName}" to:`, displayName);
    if (newName !== null) {
      const trimmed = newName.trim();
      if (trimmed && trimmed !== category) {
        this.service.renameCategory(category, trimmed);
      }
    }
  }

  /**
   * Prompt before deleting a category and its expenses.
   */
  confirmDeleteCategory(category: string) {
    const displayName = this.capitalize(category);
    const msg = `Deleting the category "${displayName}" will remove ALL expenses within this category.\nAre you sure you want to continue?`;
    if (confirm(msg)) {
      this.service.deleteCategory(category);
    }
  }
}
