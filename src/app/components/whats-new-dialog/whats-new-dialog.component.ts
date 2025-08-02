import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../shared.module';

import whatsNewData from '../../../assets/whats-new.json' assert { type: 'json' };

export interface WhatsNewEntry {
  version: string;
  changes: string[];
}

@Component({
  selector: 'app-whats-new-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './whats-new-dialog.component.html',
  styleUrls: ['./whats-new-dialog.component.css']
})
export class WhatsNewDialogComponent {
  @Output() closed = new EventEmitter<void>();

  entries: WhatsNewEntry[];

  constructor() {
    // Cast imported JSON to typed array
    const allEntries = whatsNewData as WhatsNewEntry[];
    const seenVersion = localStorage.getItem('whats-new-version') ?? '0.0.0';

    this.entries = allEntries
      .filter((e) => this.compareVersions(e.version, seenVersion) > 0)
      .sort((a, b) => this.compareVersions(b.version, a.version));
  }

  close() {
    this.closed.emit();
  }

  /**
   * Simple semantic-version comparison.
   * Returns 1 if a > b, -1 if a < b, 0 if equal.
   */
  private compareVersions(a: string, b: string): number {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);

    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const diff = (pa[i] || 0) - (pb[i] || 0);
      if (diff !== 0) {
        return diff > 0 ? 1 : -1;
      }
    }
    return 0;
  }
}
