import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLeaveEditComponent } from './employee-leave-edit.component';

describe('EmployeeLeaveEditComponent', () => {
  let component: EmployeeLeaveEditComponent;
  let fixture: ComponentFixture<EmployeeLeaveEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeLeaveEditComponent]
    });
    fixture = TestBed.createComponent(EmployeeLeaveEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
