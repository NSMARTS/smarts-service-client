import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerEmployeesAddComponent } from './manager-employees-add.component';

describe('ManagerEmployeesAddComponent', () => {
  let component: ManagerEmployeesAddComponent;
  let fixture: ComponentFixture<ManagerEmployeesAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManagerEmployeesAddComponent],
    });
    fixture = TestBed.createComponent(ManagerEmployeesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
