import { Component } from '@angular/core';
import { SharedModule } from '../shared.module';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-split-calculator',
  standalone: true,
  imports: [SharedModule],
  template: `
    <h3 class="mt-3">Split Calculator</h3>
    <hr>
    <form class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <label class="form-label">Total Amount Paid</label>
        <input type="number" class="form-control" [(ngModel)]="total" name="total" min="0.01" step="0.01" required />
      </div>
      <div class="col-12 col-md-6">
        <label class="form-label">Number of People</label>
        <input type="number" class="form-control" [(ngModel)]="count" name="count" min="1" required />
      </div>
    </form>
    <div *ngIf="total > 0 && count > 0" class="alert alert-info split-theme-box">
      <i class="bi bi-person-circle me-2"></i>
      <strong>Your share:</strong> ₹{{ share | number:'1.2-2' }}
      <button class="btn btn-sm btn-outline-primary ms-3" (click)="showAdd = !showAdd" type="button">
        <i class="bi bi-plus-circle"></i> Add My Share as Expense
      </button>
    </div>
    <form *ngIf="showAdd && total > 0 && count > 0" (ngSubmit)="addSplitExpense()" class="card card-body mb-3 split-theme-card border-0">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-4">
          <label class="form-label">Category</label>
          <!-- Category dropdown with custom option -->
          <ng-container *ngIf="categories.length > 0; else textInput">
            <select class="form-select" [(ngModel)]="category" name="category" required>
              <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
              <option value="__custom__">Custom...</option>
            </select>
            <input *ngIf="category === '__custom__'" type="text" class="form-control mt-2" [(ngModel)]="customCategory" name="customCategory" placeholder="New Category" [required]="category === '__custom__'" />
          </ng-container>
          <ng-template #textInput>
            <input type="text" class="form-control" [(ngModel)]="category" name="category" required />
          </ng-template>
        </div>
        <div class="col-12 col-md-6">
          <label class="form-label">Description</label>
          <input type="text" class="form-control" [(ngModel)]="description" name="description" required placeholder="Description" />
        </div>
        <div class="col-12 col-md-2">
          <button class="btn btn-success w-100" type="submit">
            <i class="bi bi-check-circle"></i> Add
          </button>
        </div>
      </div>
      <div *ngIf="added" class="alert alert-success mt-3 mb-0 py-2">
        Added to your expenses!
      </div>
    </form>
  `,
  styles: [
    `.split-theme-box {
      background-color: var(--background) !important;
      color: var(--foreground) !important;
      border: 1px solid var(--border) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .split-theme-card {
      background-color: var(--background) !important;
      color: var(--foreground) !important;
      border: 1px solid var(--border) !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    body.dark-mode .split-theme-box,
    body.dark-mode .split-theme-card {
      background-color: #23272b !important;
      color: var(--foreground) !important;
      border: 1px solid var(--border) !important;
    }
  `]
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