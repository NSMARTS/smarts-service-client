import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetiredManagerListComponent } from './retired-manager.component';

describe('RetiredManagerListComponent', () => {
  let component: RetiredManagerListComponent;
  let fixture: ComponentFixture<RetiredManagerListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetiredManagerListComponent],
    });
    fixture = TestBed.createComponent(RetiredManagerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
