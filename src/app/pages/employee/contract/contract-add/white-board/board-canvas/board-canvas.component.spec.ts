import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardCanvasComponent } from './board-canvas.component';

describe('BoardCanvasComponent', () => {
  let component: BoardCanvasComponent;
  let fixture: ComponentFixture<BoardCanvasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BoardCanvasComponent]
    });
    fixture = TestBed.createComponent(BoardCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
