import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerManagementComponent } from './manager-management.component';

describe('ManagerEditComponent', () => {
  let component: ManagerManagementComponent;
  let fixture: ComponentFixture<ManagerManagementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManagerManagementComponent],
    });
    fixture = TestBed.createComponent(ManagerManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
