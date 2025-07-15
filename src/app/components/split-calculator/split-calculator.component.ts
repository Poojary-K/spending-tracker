import { Component } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-split-calculator',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './split-calculator.component.html',
  styleUrls: ['./split-calculator.component.css']
})
export class SplitCalculatorComponent {
  total = 0;
  count = 1;
  showAdd = false;
  category = '';
  customCategory = '';
  description = '';
  added = false;

  constructor(private service: ExpenseService) {}

  get categories(): string[] {
    return this.service.getCategories();
  }

  get share(): number {
    return this.count > 0 ? this.total / this.count : 0;
  }

  addSplitExpense() {
    let category = this.category;
    if (category === '__custom__') {
      category = this.customCategory.trim();
    }
    if (!category || !this.description.trim()) return;
    this.service.addExpense({
      date: new Date().toISOString().slice(0, 10),
      category: category.trim(),
      description: `Split: ${this.description.trim()}`,
      amount: +this.share
    });
    this.added = true;
    setTimeout(() => this.added = false, 2000);
    this.showAdd = false;
    // Optionally reset fields:
    this.category = '';
    this.customCategory = '';
    this.description = '';
  }
} 