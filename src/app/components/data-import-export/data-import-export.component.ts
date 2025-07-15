import { Component } from '@angular/core';
import { SharedModule } from '../../shared.module';
import { ExpenseService } from '../../services/expense.service';

@Component({
  selector: 'app-data-import-export',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './data-import-export.component.html'
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