import { Component } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  templateUrl: './add-expense.component.html',
  imports: [SharedModule]
})
export class AddExpenseComponent {
  expense: Expense = {
    date: new Date().toISOString().slice(0, 10),
    category: '',
    description: '',
    amount: 0
  };

  /**
   * Holds the value of the custom category input if 'Custom...' is selected.
   */
  customCategory: string = '';

  /**
   * List of known categories for dropdown.
   */
  get categories(): string[] {
    return this.service.getCategories();
  }

  constructor(private service: ExpenseService) {}

  capitalizeCategory(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  add() {
    let category = this.expense.category;
    if (category === '__custom__') {
      category = this.customCategory.trim();
    }
    if (!category || !this.expense.amount || !this.expense.date || !this.expense.description) return;

    // Capitalize the category
    category = this.capitalizeCategory(category);

    this.service.addExpense({ ...this.expense, category });

    // Reset the form fields, but keep category for convenience
    this.expense = {
      ...this.expense,
      category: '',
      description: '',
      amount: 0
    };
    this.customCategory = '';
  }
}
