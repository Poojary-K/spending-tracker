import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AddExpenseComponent } from './add-expense.component';
import { ExpenseService } from '../../services/expense.service';
import { Expense } from '../../models/expense.model';

/**
 * Unit tests for AddExpenseComponent.
 * Verifies rounding of floating point numbers and navigation after adding.
 */
describe('AddExpenseComponent', () => {
  let component: AddExpenseComponent;
  let fixture: ComponentFixture<AddExpenseComponent>;
  let expenseService: jasmine.SpyObj<ExpenseService>;
  let router: Router;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('ExpenseService', ['addExpense', 'getCategories']);
    serviceSpy.getCategories.and.returnValue([]);

    await TestBed.configureTestingModule({
      imports: [AddExpenseComponent, RouterTestingModule],
      providers: [{ provide: ExpenseService, useValue: serviceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(AddExpenseComponent);
    component = fixture.componentInstance;
    expenseService = TestBed.inject(ExpenseService) as jasmine.SpyObj<ExpenseService>;
    router = TestBed.inject(Router);
  });

  it('should round amount to two decimals and navigate back to dashboard', () => {
    spyOn(router, 'navigate');

    const testExpense: Expense = {
      date: '2024-01-01',
      category: 'Food',
      description: 'Burger',
      amount: 99.9999999
    };

    component.expense = { ...testExpense };
    component.add();

    expect(expenseService.addExpense).toHaveBeenCalled();

    // Extract the argument passed to addExpense and verify rounding.
    const passedExpense = expenseService.addExpense.calls.mostRecent().args[0] as Expense;
    expect(passedExpense.amount).toBe(100);

    // Ensure navigation back to dashboard happened.
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
