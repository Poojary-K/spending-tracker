export interface MonthlyIncome {
  month: string; // YYYY-MM format
  amount: number;
}

export interface IncomeData {
  userId: string;
  months: {
    [month: string]: MonthlyIncome;
  };
}

export interface FinancialInsight {
  spendingPercentage: number;
  savingPercentage: number;
  remainingAmount: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  color: string;
}
