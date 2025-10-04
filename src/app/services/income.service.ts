import { Injectable } from '@angular/core';
import { MonthlyIncome, IncomeData, FinancialInsight } from '../models/income.model';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'spending-tracker-income';

/**
 * IncomeService manages all income data and emits real-time updates
 * using an RxJS BehaviorSubject. Components can subscribe to changes$.
 */
@Injectable({ providedIn: 'root' })
export class IncomeService {
  private data: IncomeData;

  /**
   * Emits the current IncomeData for real-time updates.
   */
  private data$ = new BehaviorSubject<IncomeData>(this.load());

  constructor() {
    this.data = this.data$.value;
  }

  /**
   * Observable for components to subscribe to income data changes.
   */
  get changes$() {
    return this.data$.asObservable();
  }

  /**
   * Loads income data from localStorage or returns default structure.
   */
  private load(): IncomeData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load income data from localStorage:', e);
    }

    return {
      userId: 'default',
      months: {}
    };
  }

  /**
   * Saves current data to localStorage and emits update.
   */
  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.data$.next(this.data);
    } catch (e) {
      console.error('Failed to save income data to localStorage:', e);
    }
  }

  /**
   * Sets monthly income for a specific month.
   */
  setMonthlyIncome(month: string, amount: number): void {
    if (!month || amount < 0) return;

    // Ensure data structure is initialized
    if (!this.data) {
      this.data = { userId: 'default', months: {} };
    }
    if (!this.data.months) {
      this.data.months = {};
    }

    this.data.months[month] = {
      month,
      amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
    };

    this.save();
  }

  /**
   * Sets universal income that applies to all months.
   */
  setUniversalIncome(amount: number): void {
    if (amount < 0) return;

    // Ensure data structure is initialized
    if (!this.data) {
      this.data = { userId: 'default', months: {} };
    }
    if (!this.data.months) {
      this.data.months = {};
    }

    // Set universal income for all existing months
    const roundedAmount = Math.round(amount * 100) / 100;
    Object.keys(this.data.months).forEach(month => {
      this.data.months[month].amount = roundedAmount;
    });

    // Also set for current month if it doesn't exist
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (!this.data.months[currentMonth]) {
      this.data.months[currentMonth] = {
        month: currentMonth,
        amount: roundedAmount
      };
    } else {
      this.data.months[currentMonth].amount = roundedAmount;
    }

    this.save();
  }

  /**
   * Gets monthly income for a specific month.
   */
  getMonthlyIncome(month: string): number {
    return this.data?.months?.[month]?.amount || 0;
  }

  /**
   * Gets universal income (income that applies to all months).
   * Returns the income from the most recent month as the universal income.
   */
  getUniversalIncome(): number {
    const allMonths = this.getAllMonths();
    if (allMonths.length === 0) return 0;
    
    // Return the income from the most recent month as universal income
    const mostRecentMonth = allMonths[0];
    return this.getMonthlyIncome(mostRecentMonth);
  }

  /**
   * Gets all months that have income data.
   */
  getAllMonths(): string[] {
    return Object.keys(this.data?.months || {}).sort((a, b) => b.localeCompare(a));
  }

  /**
   * Deletes income data for a specific month.
   */
  deleteMonthlyIncome(month: string): void {
    if (this.data?.months?.[month]) {
      delete this.data.months[month];
      this.save();
    }
  }

  /**
   * Calculates financial insights for a given month.
   */
  calculateFinancialInsight(month: string, totalExpenses: number): FinancialInsight {
    const monthlyIncome = this.getMonthlyIncome(month);
    
    if (monthlyIncome === 0) {
      return {
        spendingPercentage: 0,
        savingPercentage: 0,
        remainingAmount: 0,
        rating: 'excellent',
        color: '#28a745'
      };
    }

    const spendingPercentage = Math.round((totalExpenses / monthlyIncome) * 100);
    const savingPercentage = Math.round(((monthlyIncome - totalExpenses) / monthlyIncome) * 100);
    const remainingAmount = Math.round((monthlyIncome - totalExpenses) * 100) / 100;

    // Calculate rating based on spending percentage
    let rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    let color: string;

    if (spendingPercentage <= 30) {
      rating = 'excellent';
      color = '#28a745'; // Green
    } else if (spendingPercentage <= 50) {
      rating = 'good';
      color = '#ffc107'; // Yellow
    } else if (spendingPercentage <= 70) {
      rating = 'fair';
      color = '#fd7e14'; // Orange
    } else if (spendingPercentage <= 90) {
      rating = 'poor';
      color = '#dc3545'; // Red
    } else {
      rating = 'critical';
      color = '#6f42c1'; // Purple
    }

    return {
      spendingPercentage: Math.max(0, spendingPercentage),
      savingPercentage: Math.max(0, savingPercentage),
      remainingAmount: Math.max(0, remainingAmount),
      rating,
      color
    };
  }

  /**
   * Exports all income data as JSON string.
   */
  exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Imports income data from JSON string.
   */
  importData(jsonData: string): void {
    try {
      const importedData = JSON.parse(jsonData);
      
      // Validate the imported data structure
      if (importedData && typeof importedData === 'object' && importedData.months) {
        this.data = importedData;
        this.save();
      } else {
        throw new Error('Invalid income data format');
      }
    } catch (e) {
      console.error('Failed to import income data:', e);
      throw new Error('Invalid JSON format for income data');
    }
  }

  /**
   * Gets all income data for export/import compatibility.
   */
  getAllIncomeData(): IncomeData {
    return { ...this.data };
  }
}
