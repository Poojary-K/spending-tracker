import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LendingService } from '../../services/lending.service';
import { Lending } from '../../models/lending.model';
import { SharedModule } from '../../shared.module';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lending',
  standalone: true,
  templateUrl: './lending.component.html',
  styleUrls: ['./lending.component.css'],
  imports: [SharedModule, NgbPopoverModule]
})
export class LendingComponent implements OnInit, OnDestroy {
  lendings: Lending[] = [];
  editingLending: Lending | null = null;
  newLending: Partial<Lending> = {
    date: new Date().toISOString().slice(0, 10),
    type: 'lent',
    status: 'active',
    amount: 0
  };
  
  private sub?: Subscription;

  constructor(
    public lendingService: LendingService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.sub = this.lendingService.changes$.subscribe(() => {
      this.lendings = this.lendingService.getAllLendings();
    });
    this.lendings = this.lendingService.getAllLendings();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  getActiveLendings(): Lending[] {
    return this.lendings.filter(l => l.status === 'active');
  }

  getLentToOthers(): Lending[] {
    return this.lendings.filter(l => l.type === 'lent' && l.status === 'active');
  }

  getBorrowedFromOthers(): Lending[] {
    return this.lendings.filter(l => l.type === 'borrowed' && l.status === 'active');
  }

  getRepaidLendings(): Lending[] {
    return this.lendings.filter(l => l.status === 'repaid');
  }

  // Group lendings by person name
  getGroupedLendings(): { [personName: string]: Lending[] } {
    const grouped: { [personName: string]: Lending[] } = {};
    this.getActiveLendings().forEach(lending => {
      if (!grouped[lending.personName]) {
        grouped[lending.personName] = [];
      }
      grouped[lending.personName].push(lending);
    });
    return grouped;
  }

  getPersonNames(): string[] {
    return Object.keys(this.getGroupedLendings());
  }

  getPersonTotal(personName: string): number {
    const personLendings = this.getGroupedLendings()[personName] || [];
    return personLendings.reduce((sum, lending) => {
      return sum + (lending.type === 'lent' ? lending.amount : -lending.amount);
    }, 0);
  }

  getPersonLentTotal(personName: string): number {
    const personLendings = this.getGroupedLendings()[personName] || [];
    return personLendings
      .filter(l => l.type === 'lent')
      .reduce((sum, lending) => sum + lending.amount, 0);
  }

  getPersonBorrowedTotal(personName: string): number {
    const personLendings = this.getGroupedLendings()[personName] || [];
    return personLendings
      .filter(l => l.type === 'borrowed')
      .reduce((sum, lending) => sum + lending.amount, 0);
  }


  openAddModal(content: any) {
    this.resetForm();
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  addLending() {
    if (!this.newLending.personName || !this.newLending.amount || !this.newLending.date) {
      return;
    }

    this.lendingService.addLending({
      date: this.newLending.date!,
      personName: this.newLending.personName!,
      amount: this.newLending.amount!,
      description: this.newLending.description || '',
      type: this.newLending.type!,
      status: this.newLending.status!
    });

    this.resetForm();
    this.modalService.dismissAll();
  }

  startEdit(lending: Lending, content: any) {
    this.editingLending = { ...lending };
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  saveEdit() {
    if (this.editingLending) {
      this.lendingService.updateLending(this.editingLending);
      this.editingLending = null;
      this.modalService.dismissAll();
    }
  }

  cancelEdit() {
    this.editingLending = null;
  }

  deleteLending(lending: Lending) {
    const confirmMsg = `Are you sure you want to delete: ₹${lending.amount} ${lending.type === 'lent' ? 'lent to' : 'borrowed from'} "${lending.personName}"?`;
    if (confirm(confirmMsg)) {
      this.lendingService.deleteLending(lending.id);
    }
  }

  markAsRepaid(lending: Lending) {
    const confirmMsg = `Mark ₹${lending.amount} ${lending.type === 'lent' ? 'lent to' : 'borrowed from'} "${lending.personName}" as repaid?`;
    if (confirm(confirmMsg)) {
      this.lendingService.markAsRepaid(lending.id);
    }
  }

  resetForm() {
    this.newLending = {
      date: new Date().toISOString().slice(0, 10),
      type: 'lent',
      status: 'active',
      amount: 0
    };
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

  getTotalLent(): number {
    return this.lendingService.getTotalLent();
  }

  getTotalBorrowed(): number {
    return this.lendingService.getTotalBorrowed();
  }

  getNetLending(): number {
    return this.lendingService.getNetLending();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
