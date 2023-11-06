import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProfileEditComponent } from './employee-profile-edit.component';

describe('EmployeeProfileEditComponent', () => {
  let component: EmployeeProfileEditComponent;
  let fixture: ComponentFixture<EmployeeProfileEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [EmployeeProfileEditComponent]
    });
    fixture = TestBed.createComponent(EmployeeProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
