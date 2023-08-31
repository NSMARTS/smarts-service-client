import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerEditComponent } from './manager-edit.component';

describe('ManagerEditComponent', () => {
  let component: ManagerEditComponent;
  let fixture: ComponentFixture<ManagerEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ManagerEditComponent]
    });
    fixture = TestBed.createComponent(ManagerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
