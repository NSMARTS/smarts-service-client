import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindUserLogsComponent } from './find-user-logs.component';

describe('FindUserLogsComponent', () => {
  let component: FindUserLogsComponent;
  let fixture: ComponentFixture<FindUserLogsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FindUserLogsComponent]
    });
    fixture = TestBed.createComponent(FindUserLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
