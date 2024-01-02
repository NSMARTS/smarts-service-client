import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractAddDialogComponent } from './contract-add-dialog.component';

describe('ContractAddComponent', () => {
  let component: ContractAddDialogComponent;
  let fixture: ComponentFixture<ContractAddDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContractAddDialogComponent]
    });
    fixture = TestBed.createComponent(ContractAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
