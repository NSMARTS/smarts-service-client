import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardSlideComponent } from './board-slide.component';

describe('BoardSlideComponent', () => {
  let component: BoardSlideComponent;
  let fixture: ComponentFixture<BoardSlideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardSlideComponent]
    });
    fixture = TestBed.createComponent(BoardSlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
