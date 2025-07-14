import { Component, Input, OnChanges } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-expense-list',
  standalone: true,
  templateUrl: './expense-list.component.html',
  imports: [CommonModule, FormsModule]
})
export class ExpenseListComponent implements OnChanges {
  @Input() month = new Date().toISOString().slice(0, 7);
  groupedExpenses: { [category: string]: Expense[] } = {};
  editing: Expense | null = null;
  originalCopy: Expense | null = null;

  constructor(public service: ExpenseService) {}

  ngOnChanges() {
    this.groupExpenses();
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
    return this.groupedExpenses[category].reduce((sum, e) => sum + e.amount, 0);
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
      this.groupExpenses();
    }
  }

  confirmDelete(expense: Expense) {
    const confirmMsg = `Are you sure you want to delete: ₹${expense.amount} for "${expense.description}" on ${this.formatDate(expense.date)}?`;
    if (confirm(confirmMsg)) {
      this.deleteExpense(expense);
    }
  }

  deleteExpense(expense: Expense) {
    this.service.deleteExpense(expense);
    this.groupExpenses();
  }
}
