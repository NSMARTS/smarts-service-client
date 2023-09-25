import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardFabsComponent } from './board-fabs.component';

describe('BoardFabsComponent', () => {
  let component: BoardFabsComponent;
  let fixture: ComponentFixture<BoardFabsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardFabsComponent]
    });
    fixture = TestBed.createComponent(BoardFabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
