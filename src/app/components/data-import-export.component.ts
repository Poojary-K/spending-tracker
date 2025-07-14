import { Component } from '@angular/core';
import { SharedModule } from '../shared.module';
import { ExpenseService } from '../services/expense.service';

@Component({
  selector: 'app-data-import-export',
  standalone: true,
  imports: [SharedModule],
  template: `
    <h3 class="mt-3">Data Import/Export</h3>
    <hr>
    <div class="mb-3">
      <button class="btn btn-outline-secondary me-2" (click)="exportData()">
        <i class="bi bi-download me-1"></i> Export Data
      </button>
      <input type="file" class="form-control d-inline-block w-auto" (change)="importData($event)" accept=".json" />
    </div>
    <div *ngIf="exportedJson" class="alert alert-success mt-3">
      Data exported!<br>
      <a [href]="exportedJson" download="spending-tracker.json">Download spending-tracker.json</a>
    </div>
  `
})
export class DataImportExportComponent {
  exportedJson: string | null = null;

  constructor(private service: ExpenseService) {}

  exportData() {
    const data = this.service.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    this.exportedJson = URL.createObjectURL(blob);
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
        alert('Data imported successfully!');
      } catch (e) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }
} 