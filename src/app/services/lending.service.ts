import { Injectable } from '@angular/core';
import { Lending, LendingData } from '../models/lending.model';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'spending-tracker-lending';

/**
 * LendingService manages all lending/borrowing data and emits real-time updates
 * using an RxJS BehaviorSubject. Components can subscribe to changes$.
 */
@Injectable({ providedIn: 'root' })
export class LendingService {
  private data: LendingData;

  /**
   * Emits the current LendingData for real-time updates.
   */
  private data$ = new BehaviorSubject<LendingData>(this.load());

  constructor() {
    this.data = this.load();
  }

  /**
   * Observable for components to subscribe to lending data changes.
   */
  get changes$() {
    return this.data$.asObservable();
  }

  private load(): LendingData {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw
      ? JSON.parse(raw)
      : { userId: 'default', lendings: [] };
  }

  private saveAndEmit(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.data$.next(this.data);
  }

  getAllLendings(): Lending[] {
    return [...(this.data?.lendings || [])];
  }

  getActiveLendings(): Lending[] {
    return this.data?.lendings?.filter(l => l.status === 'active') || [];
  }

  getLentToOthers(): Lending[] {
    return this.data?.lendings?.filter(l => l.type === 'lent' && l.status === 'active') || [];
  }

  getBorrowedFromOthers(): Lending[] {
    return this.data?.lendings?.filter(l => l.type === 'borrowed' && l.status === 'active') || [];
  }

  addLending(lending: Omit<Lending, 'id'>): void {
    const newLending: Lending = {
      ...lending,
      id: this.generateId()
    };
    
    // Ensure lendings array exists
    if (!this.data.lendings) {
      this.data.lendings = [];
    }
    
    this.data.lendings.push(newLending);
    this.saveAndEmit();
  }

  updateLending(updated: Lending): void {
    // Ensure lendings array exists
    if (!this.data.lendings) {
      this.data.lendings = [];
    }
    
    const index = this.data.lendings.findIndex(l => l.id === updated.id);
    if (index !== -1) {
      this.data.lendings[index] = updated;
      this.saveAndEmit();
    }
  }

  deleteLending(id: string): void {
    // Ensure lendings array exists
    if (!this.data.lendings) {
      this.data.lendings = [];
    }
    
    this.data.lendings = this.data.lendings.filter(l => l.id !== id);
    this.saveAndEmit();
  }

  markAsRepaid(id: string, repaymentDate?: string): void {
    // Ensure lendings array exists
    if (!this.data.lendings) {
      this.data.lendings = [];
    }
    
    const lending = this.data.lendings.find(l => l.id === id);
    if (lending) {
      lending.status = 'repaid';
      lending.repaymentDate = repaymentDate || new Date().toISOString().slice(0, 10);
      this.saveAndEmit();
    }
  }

  getTotalLent(): number {
    return this.getLentToOthers().reduce((sum, l) => sum + l.amount, 0);
  }

  getTotalBorrowed(): number {
    return this.getBorrowedFromOthers().reduce((sum, l) => sum + l.amount, 0);
  }

  getNetLending(): number {
    return this.getTotalLent() - this.getTotalBorrowed();
  }

  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  importData(json: string): void {
    this.data = JSON.parse(json);
    this.saveAndEmit();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
