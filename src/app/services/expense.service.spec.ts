import { TestBed } from '@angular/core/testing';
import { ExpenseService } from './expense.service';
import { Expense } from '../models/expense.model';

describe('ExpenseService category management', () => {
  let service: ExpenseService;

  // Mock localStorage helpers
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      for (const k in store) delete store[k];
    }
  } as any;

  beforeEach(() => {
    // Reset in-memory store
    mockLocalStorage.clear();
    spyOn(Storage.prototype, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(Storage.prototype, 'setItem').and.callFake(mockLocalStorage.setItem);

    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseService);
  });

  it('should rename category across expenses and category list', () => {
    // Arrange: add expense under "food"
    const expense: Expense = {
      date: '2024-07-01',
      category: 'food',
      description: 'Lunch',
      amount: 150
    };
    service.addExpense(expense);

    // Act
    service.renameCategory('food', 'dining');

    // Assert: category list updated
    expect(service.getCategories()).toContain('dining');
    expect(service.getCategories()).not.toContain('food');

    // Assert: expenses updated
    const expenses = service.getExpenses('2024-07');
    expect(expenses.length).toBe(1);
    expect(expenses[0].category).toBe('Dining');
  });

  it('should delete category and associated expenses', () => {
    // Arrange
    const expense1: Expense = {
      date: '2024-07-02',
      category: 'travel',
      description: 'Bus',
      amount: 50
    };
    const expense2: Expense = {
      date: '2024-07-03',
      category: 'groceries',
      description: 'Veggies',
      amount: 200
    };
    service.addExpense(expense1);
    service.addExpense(expense2);

    // Pre-check
    expect(service.getCategories()).toContain('travel');
    expect(service.getExpenses('2024-07').length).toBe(2);

    // Act
    service.deleteCategory('travel');

    // Categories list should not include removed category
    expect(service.getCategories()).not.toContain('travel');

    // Expenses with deleted category removed
    const remaining = service.getExpenses('2024-07');
    expect(remaining.length).toBe(1);
    expect(remaining[0].category).toBe('Groceries');
  });
});
