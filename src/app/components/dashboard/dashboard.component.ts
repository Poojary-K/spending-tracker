import { Component } from '@angular/core';
import { ExpenseService } from '../../services/expense.service';
import { SharedModule } from '../../shared.module';
import { ExpenseListComponent } from '../expense-list/expense-list.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  imports: [SharedModule, ExpenseListComponent]
})
export class DashboardComponent {
  months: string[] = [];
  selectedMonth: string;

  constructor(public service: ExpenseService) {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    // Get all months from expenses
    this.months = this.service.getAllMonths();

    // Ensure current month is included
    if (!this.months.includes(currentMonth)) {
      this.months.push(currentMonth);
    }

    // Sort months descending (latest first)
    this.months.sort((a, b) => b.localeCompare(a));

    // Select current month
    this.selectedMonth = currentMonth;
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

  total(month: string): number {
    return this.service.getExpenses(month).reduce((sum, e) => sum + e.amount, 0);
  }

  exportData(): void {
  const data = this.service.exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'spending-tracker-data.json';
  a.click();

  URL.revokeObjectURL(url);
}

importData(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const json = reader.result as string;
      this.service.importData(json);

      // Reload months and select current month
      this.months = this.service.getAllMonths();
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (!this.months.includes(currentMonth)) {
        this.months.push(currentMonth);
      }
      this.months.sort((a, b) => b.localeCompare(a));
      this.selectedMonth = currentMonth;
    } catch (e) {
      alert('Invalid JSON file.');
    }
  };

  reader.readAsText(file);
}


}
