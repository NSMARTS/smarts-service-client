import { TestBed } from '@angular/core/testing';

import { CompanyHolidayService } from './company-holiday.service';

describe('CompanyHolidayService', () => {
  let service: CompanyHolidayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyHolidayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
