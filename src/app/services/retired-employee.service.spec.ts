import { TestBed } from '@angular/core/testing';

import { RetiredEmployeeService } from './retired-employee.service';

describe('RetiredEmployeeService', () => {
  let service: RetiredEmployeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RetiredEmployeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
