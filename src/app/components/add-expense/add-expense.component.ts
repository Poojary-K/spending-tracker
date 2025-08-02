import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private service: ExpenseService, private router: Router) {}

  capitalizeCategory(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  add() {
    let category = this.expense.category;
    if (category === '__custom__') {
      category = this.customCategory.trim();
    }
    if (!category || !this.expense.amount || !this.expense.date) return;

    // Capitalize the category
    category = this.capitalizeCategory(category);

    // Round amount to two decimal places to avoid floating-point precision errors
    const roundedAmount = Math.round(this.expense.amount * 100) / 100;

    this.service.addExpense({ ...this.expense, category, amount: roundedAmount });

    // Navigate back to dashboard after successful add
    this.router.navigate(['/dashboard']);

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
