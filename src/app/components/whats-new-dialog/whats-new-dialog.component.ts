import { Component, EventEmitter, Output } from '@angular/core';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-whats-new-dialog',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './whats-new-dialog.component.html',
  styleUrls: ['./whats-new-dialog.component.css']
})
export class WhatsNewDialogComponent {
  @Output() closed = new EventEmitter<void>();

  close() {
    this.closed.emit();
  }
}
