import { Component } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { ExpenseService } from '../../services/expense.service';
import { IncomeService } from '../../services/income.service';
import { LendingService } from '../../services/lending.service';

@Component({
  selector: 'app-data-import-export',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './data-import-export.component.html'
})
export class DataImportExportComponent {
  exportedJson: string | null = null;

  constructor(
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private lendingService: LendingService
  ) {}

  exportData() {
    // Combine all data from different services
    const combinedData = {
      expenses: JSON.parse(this.expenseService.exportData()),
      income: JSON.parse(this.incomeService.exportData()),
      lending: JSON.parse(this.lendingService.exportData()),
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const data = JSON.stringify(combinedData, null, 2);
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
        const data = JSON.parse(json);
        
        // Handle both old format (single service) and new format (combined)
        if (data.version === '2.0' && data.expenses && data.income && data.lending) {
          // New combined format
          this.expenseService.importData(JSON.stringify(data.expenses));
          this.incomeService.importData(JSON.stringify(data.income));
          this.lendingService.importData(JSON.stringify(data.lending));
        } else {
          // Legacy format - try to import as expense data
          this.expenseService.importData(json);
        }
        
        alert('Data imported successfully!');
      } catch (e) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }
} 