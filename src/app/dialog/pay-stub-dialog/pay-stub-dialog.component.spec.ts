import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayStubDialogComponent } from './pay-stub-dialog.component';

describe('PayStubDialogComponent', () => {
  let component: PayStubDialogComponent;
  let fixture: ComponentFixture<PayStubDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PayStubDialogComponent]
    });
    fixture = TestBed.createComponent(PayStubDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
