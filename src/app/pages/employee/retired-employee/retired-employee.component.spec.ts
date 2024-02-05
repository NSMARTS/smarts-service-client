import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetiredEmployeeListComponent } from './retired-employee.component';

describe('RetiredEmployeeListComponent', () => {
  let component: RetiredEmployeeListComponent;
  let fixture: ComponentFixture<RetiredEmployeeListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetiredEmployeeListComponent],
    });
    fixture = TestBed.createComponent(RetiredEmployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
