import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerAddComponent } from './manager-add.component';

describe('ManagerAddComponent', () => {
  let component: ManagerAddComponent;
  let fixture: ComponentFixture<ManagerAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManagerAddComponent]
    });
    fixture = TestBed.createComponent(ManagerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
