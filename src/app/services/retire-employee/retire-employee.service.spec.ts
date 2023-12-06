import { TestBed } from '@angular/core/testing';
import { RetireEmployeeService } from './retire-employee.service';

describe('RetireEmployeeService', () => {
  let service: RetireEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetireEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
