import { Component, DestroyRef, ElementRef, HostListener, Inject, ViewChild, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ContractService } from 'src/app/services/contract/contract.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CANVAS_CONFIG } from 'src/app/config/canvas-css';
import { EditInfoService } from 'src/app/stores/edit-info/edit-info.service';
import { DrawStoreService } from 'src/app/services/draw-store/draw-store.service';
import { CanvasService } from 'src/app/services/canvas/canvas.service';
import { RenderingService } from 'src/app/services/rendering/rendering.service';

@Component({
  selector: 'app-contract-detail-dialog',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './contract-detail-dialog.component.html',
  styleUrls: ['./contract-detail-dialog.component.scss']
})
export class ContractDetailDialogComponent implements AfterViewInit {
  // 상위 컴포넌트에서 받아온 값
  public dialogRef = inject(MatDialogRef<ContractDetailDialogComponent>)
  // 서비스 의존성 주입
  snackbar = inject(MatSnackBar);
  formBuilder = inject(FormBuilder);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  renderingService = inject(RenderingService)
  contractService = inject(ContractService);
  editInfoService = inject(EditInfoService)
  drawStoreService = inject(DrawStoreService)



  @ViewChild('canvasContainer', { static: false }) public canvasContainerRef!: ElementRef;
  @ViewChild('employeeCanvasCover', { static: false }) public employeeCanvasCoverRef!: ElementRef;
  @ViewChild('employeeCanvas', { static: false }) public employeeCanvasRef!: ElementRef;
  @ViewChild('managerCanvasCover', { static: false }) public managerCanvasCoverRef!: ElementRef;
  @ViewChild('managerCanvas', { static: false }) public managerCanvasRef!: ElementRef;


  canvasContainer!: HTMLDivElement;
  employeeCanvasCover!: HTMLCanvasElement;
  employeeCanvas!: HTMLCanvasElement;
  managerCanvasCover!: HTMLCanvasElement;
  managerCanvas!: HTMLCanvasElement

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(this.data)
  }

  ngAfterViewInit() {
    this.setCanvasSize()

    // 매니저 서명이 존재하면 매니저 서명 draw
    if (this.data?.managerStatus === 'signed') {
      this.drawStoreService.drawVar.set(this.data?.managerSign)
      this.pageRender(this.managerCanvas)
      this.drawStoreService.resetDrawingEvents(); // 매니저 서명을 그리고 나면 초기화
    }

    // 직원 서명이 존재하면 매니저 서명 draw
    if (this.data?.employeeStatus === 'signed') {
      this.drawStoreService.drawVar.set(this.data?.employeeSign)
      this.pageRender(this.employeeCanvas)
      this.drawStoreService.resetDrawingEvents(); // 직원 서명을 그리고 나면 초기화
    }
  }

  // Resize Event Listener
  @HostListener('window:resize') resize() {
    const newWidth = window.innerWidth
    const newHeight = window.innerHeight
    // sidenav 열릴때 resize event 발생... 방지용도.
    if (CANVAS_CONFIG.maxContainerWidth === newWidth && CANVAS_CONFIG.maxContainerHeight === newHeight) {
      return;
    }
    CANVAS_CONFIG.maxContainerWidth = newWidth;
    CANVAS_CONFIG.maxContainerHeight = newHeight;
  }

  /**
    * Canvas size 설정
    *
    * @param currentPage
    * @param zoomScale
    * @returns
    */
  setCanvasSize() {

    if (this.canvasContainerRef) {
      // canvas Element 할당
      this.canvasContainer = this.canvasContainerRef.nativeElement;
      // Canvas Container Size 조절
      this.canvasContainer.style.width = 250 + 'px';
      this.canvasContainer.style.height = 130 + 'px';
    }


    if (this.employeeCanvasRef) {
      this.employeeCanvas = this.employeeCanvasRef.nativeElement;
      this.employeeCanvasCover = this.employeeCanvasCoverRef.nativeElement;
      this.employeeCanvasCover.width = 250
      this.employeeCanvasCover.height = 130
      // Cover Canvas 조절
      this.employeeCanvas.width = this.employeeCanvasCover.width
      this.employeeCanvas.height = this.employeeCanvasCover.height
    }

    if (this.managerCanvasRef) {
      this.managerCanvas = this.managerCanvasRef.nativeElement;
      this.managerCanvasCover = this.managerCanvasCoverRef.nativeElement;
      this.managerCanvasCover.width = 250
      this.managerCanvasCover.height = 130

      this.managerCanvas.width = this.managerCanvasCover.width
      this.managerCanvas.height = this.managerCanvasCover.height
    }

  }

  pageRender(canvas: HTMLCanvasElement) {
    const drawingEvents = this.drawStoreService.getDrawingEvents(1);
    this.renderingService.renderBoard(canvas, 1, drawingEvents);
  }


}
