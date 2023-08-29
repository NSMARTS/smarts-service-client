import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayStubListComponent } from './pay-stub-list.component';

describe('PayStubListComponent', () => {
  let component: PayStubListComponent;
  let fixture: ComponentFixture<PayStubListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PayStubListComponent]
    });
    fixture = TestBed.createComponent(PayStubListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
