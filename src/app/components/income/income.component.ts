import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IncomeService } from '../../services/income.service';
import { ExpenseService } from '../../services/expense.service';
import { SharedModule } from '../../shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-income',
  standalone: true,
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.css'],
  imports: [SharedModule]
})
export class IncomeComponent implements OnInit, OnDestroy {
  months: string[] = [];
  selectedMonth: string;
  monthlyIncome: number = 0;
  private incomeSub?: Subscription;

  constructor(
    private incomeService: IncomeService,
    private expenseService: ExpenseService,
    private router: Router
  ) {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    
    // Get all months from expenses and income
    const expenseMonths = this.expenseService.getAllMonths();
    const incomeMonths = this.incomeService.getAllMonths();
    this.months = [...new Set([...expenseMonths, ...incomeMonths])];
    
    // Ensure current month is included
    if (!this.months.includes(currentMonth)) {
      this.months.push(currentMonth);
    }
    
    // Sort months descending (latest first)
    this.months.sort((a, b) => b.localeCompare(a));
    
    // Select current month
    this.selectedMonth = currentMonth;
  }

  ngOnInit() {
    this.loadMonthlyIncome();
    this.incomeSub = this.incomeService.changes$.subscribe(() => {
      this.loadMonthlyIncome();
    });
  }

  ngOnDestroy() {
    this.incomeSub?.unsubscribe();
  }

  /**
   * Loads the monthly income for the selected month.
   * Falls back to universal income if no month-specific income is set.
   */
  private loadMonthlyIncome(): void {
    const monthIncome = this.incomeService.getMonthlyIncome(this.selectedMonth);
    if (monthIncome > 0) {
      this.monthlyIncome = monthIncome;
    } else {
      // Fall back to universal income
      this.monthlyIncome = this.incomeService.getUniversalIncome();
    }
  }

  /**
   * Saves the monthly income for the selected month.
   * Also sets it as universal income for all months.
   */
  saveIncome(): void {
    if (this.monthlyIncome < 0) {
      alert('Income cannot be negative.');
      return;
    }

    // Set as universal income for all months
    this.incomeService.setUniversalIncome(this.monthlyIncome);
    alert('Income saved successfully for all months!');
  }

  /**
   * Deletes the universal income for all months.
   */
  deleteIncome(): void {
    if (confirm('Are you sure you want to delete the income for all months?')) {
      // Clear income for all months
      this.incomeService.setUniversalIncome(0);
      this.monthlyIncome = 0;
      alert('Income deleted successfully for all months!');
    }
  }

  /**
   * Converts a YYYY-MM string to a readable month name (e.g., 'June 2024').
   */
  getMonthName(ym: string): string {
    if (!ym) return '';
    const [year, month] = ym.split('-').map(Number);
    if (!year || !month) return ym;
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  /**
   * Gets the total expenses for the selected month.
   */
  getTotalExpenses(): number {
    return this.expenseService.getExpenses(this.selectedMonth).reduce((sum, e) => sum + e.amount, 0);
  }

  /**
   * Gets the remaining amount after expenses.
   */
  getRemainingAmount(): number {
    return Math.max(0, this.monthlyIncome - this.getTotalExpenses());
  }

  /**
   * Gets the spending percentage.
   */
  getSpendingPercentage(): number {
    if (this.monthlyIncome === 0) return 0;
    return Math.round((this.getTotalExpenses() / this.monthlyIncome) * 100);
  }

  /**
   * Gets the saving percentage.
   */
  getSavingPercentage(): number {
    if (this.monthlyIncome === 0) return 0;
    return Math.round((this.getRemainingAmount() / this.monthlyIncome) * 100);
  }

  /**
   * Navigates back to dashboard.
   */
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Focuses on the income input field for adding income.
   */
  addIncome(): void {
    // Focus on the income input field
    const incomeInput = document.getElementById('incomeAmount') as HTMLInputElement;
    if (incomeInput) {
      incomeInput.focus();
      incomeInput.select();
    }
  }
}
