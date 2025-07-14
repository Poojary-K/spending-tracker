export interface Expense {
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  amount: number;
  paymentMode?: string;
  tags?: string[];
}

export interface MonthlyExpense {
  expenses: Expense[];
}

export interface ExpenseData {
  userId: string;
  months: {
    [month: string]: MonthlyExpense;
  };
}
