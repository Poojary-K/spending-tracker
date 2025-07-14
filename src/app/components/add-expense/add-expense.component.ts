import { Component } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-expense',
  standalone: true,
  templateUrl: './add-expense.component.html',
  imports: [CommonModule, FormsModule]
})
export class AddExpenseComponent {
  expense: Expense = {
    date: new Date().toISOString().slice(0, 10),
    category: '',
    description: '',
    amount: 0
  };

  constructor(private service: ExpenseService) {}

  capitalizeCategory(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  add() {
    if (!this.expense.category || !this.expense.amount || !this.expense.date || !this.expense.description) return;

    // Capitalize the category
    this.expense.category = this.capitalizeCategory(this.expense.category.trim());

    this.service.addExpense(this.expense);

    // Reset the form fields
    this.expense = {
      ...this.expense,
      description: '',
      amount: 0
    };
  }
}
