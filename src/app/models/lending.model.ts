export interface Lending {
  id: string; // Unique identifier
  date: string; // YYYY-MM-DD
  personName: string;
  amount: number;
  description?: string;
  type: 'lent' | 'borrowed'; // Whether you lent money to someone or borrowed from someone
  status: 'active' | 'repaid'; // Whether the loan is still active or has been repaid
  repaymentDate?: string; // YYYY-MM-DD when it was repaid (if status is 'repaid')
}

export interface LendingData {
  userId: string;
  lendings: Lending[];
}
