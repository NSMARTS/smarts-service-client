import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComapnyListComponent } from './comapny-list.component';

describe('ComapnyListComponent', () => {
  let component: ComapnyListComponent;
  let fixture: ComponentFixture<ComapnyListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ComapnyListComponent]
    });
    fixture = TestBed.createComponent(ComapnyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
