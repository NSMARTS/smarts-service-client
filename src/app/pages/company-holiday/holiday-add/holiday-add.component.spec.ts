import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayAddComponent } from './holiday-add.component';

describe('HolidayAddComponent', () => {
  let component: HolidayAddComponent;
  let fixture: ComponentFixture<HolidayAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HolidayAddComponent]
    });
    fixture = TestBed.createComponent(HolidayAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
