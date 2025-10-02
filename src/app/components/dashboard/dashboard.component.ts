import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../../services/expense.service';
import { LendingService } from '../../services/lending.service';
import { SharedModule } from '../../shared.module';
import { ExpenseListComponent } from '../expense-list/expense-list.component';
import { Lending } from '../../models/lending.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [SharedModule, ExpenseListComponent, RouterModule]
})
export class DashboardComponent implements OnInit, OnDestroy {
  scrolled = false;
  months: string[] = [];
  selectedMonth: string;
  activeLendings: Lending[] = [];
  currentCardIndex = 0;
  private lendingSub?: Subscription;

  constructor(
    public service: ExpenseService,
    public lendingService: LendingService
  ) {
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

  ngOnInit() {
    this.lendingSub = this.lendingService.changes$.subscribe(() => {
      this.activeLendings = this.lendingService.getActiveLendings();
    });
    this.activeLendings = this.lendingService.getActiveLendings();
  }

  ngOnDestroy() {
    this.lendingSub?.unsubscribe();
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
    return Math.round(this.service.getExpenses(month).reduce((sum, e) => sum + e.amount, 0) * 100) / 100;
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

@HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 0;
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

  getTotalLent(): number {
    return this.lendingService.getTotalLent();
  }

  getTotalBorrowed(): number {
    return this.lendingService.getTotalBorrowed();
  }

  getNetLending(): number {
    return this.lendingService.getNetLending();
  }

  formatDate(iso: string): string {
    const date = new Date(iso);
    if (isNaN(date.getTime())) {
      return iso;
    }
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  markAsRepaid(lending: Lending) {
    const confirmMsg = `Mark ₹${lending.amount} ${lending.type === 'lent' ? 'lent to' : 'borrowed from'} "${lending.personName}" as repaid?`;
    if (confirm(confirmMsg)) {
      this.lendingService.markAsRepaid(lending.id);
    }
  }

  deleteLending(lending: Lending) {
    const confirmMsg = `Are you sure you want to delete: ₹${lending.amount} ${lending.type === 'lent' ? 'lent to' : 'borrowed from'} "${lending.personName}"?`;
    if (confirm(confirmMsg)) {
      this.lendingService.deleteLending(lending.id);
    }
  }

  // Carousel methods
  getTotalCards(): number {
    let total = 1; // Always have total spend card
    if (this.activeLendings.length > 0) {
      total += 2; // Add lent and borrowed cards
    }
    return total;
  }

  getCardIndices(): number[] {
    return Array.from({ length: this.getTotalCards() }, (_, i) => i);
  }

  nextCard(): void {
    if (this.currentCardIndex < this.getTotalCards() - 1) {
      this.currentCardIndex++;
    }
  }

  previousCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
    }
  }

  goToCard(index: number): void {
    this.currentCardIndex = index;
  }
}
