import { MaterialsModule } from './../../../../../../materials/materials.module';
import { Component, ElementRef, QueryList, ViewChildren, inject, WritableSignal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { PdfInfo, PdfService } from 'src/app/services/pdf/pdf.service';
import * as pdfjsLib from 'pdfjs-dist';
import { ZoomService } from 'src/app/services/zoom/zoom.service';
import { CanvasService } from 'src/app/services/canvas/canvas.service';
import { ContainerScroll, ContainerSize, Size } from 'src/app/interfaces/white-board.interface';
import { ContractService } from 'src/app/services/contract/contract.service';
import { RenderingService } from 'src/app/services/rendering/rendering.service';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/build/pdf.worker.js';

@Component({
  selector: 'app-board-slide',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,

  ],
  templateUrl: './board-slide.component.html',
  styleUrls: ['./board-slide.component.scss']
})
export class BoardSlideComponent {

  dialogService = inject(DialogService)
  pdfService = inject(PdfService)
  zoomService = inject(ZoomService)
  canvasService = inject(CanvasService)
  renderingService = inject(RenderingService)
  contractService = inject(ContractService)


  thumbArray: Size[] = [];

  // 사이드 바 썸네일 윈도우 좌표
  containerScroll: WritableSignal<ContainerScroll> = this.canvasService.containerScroll
  // 사이드 바 썸네일 윈도우 크기
  containerSize: WritableSignal<ContainerSize> = this.canvasService.containerSize

  pdfInfo: WritableSignal<PdfInfo> = this.pdfService.pdfInfo;
  pdfLength: WritableSignal<number> = this.pdfService.pdfLength
  currentPage: WritableSignal<number> = this.pdfService.currentPage
  zoomScale: WritableSignal<number> = this.zoomService.zoomScale
  contractMod: WritableSignal<string> = this.contractService.contractMod


  thumbWindowSize = {
    width: '',
    height: ''
  };

  scrollRatio: number = 1

  @ViewChildren('thumb') thumRef!: QueryList<ElementRef> // 부모 thumb-item 안에 자식 element
  @ViewChildren('thumbWindow') thumbWindowRef!: QueryList<ElementRef>

  thumbWindow!: HTMLDivElement;

  constructor() {
    // pdf 변경, 혹은 page 변경 시 onChangePage
    effect(() => {
      if (this.pdfInfo().pdfPages.length < 1) return
      this.renderThumbnails();

    }, { allowSignalWrites: true })

    /**
     *  Scroll event에 따라서 thumbnail window 위치/크기 변경
     *  --> broadcast from comclass component
     */
    effect(() => {
      this.containerScroll()
      if (this.thumbWindowRef) {
        this.thumbWindow = this.thumbWindowRef.last.nativeElement;
        this.thumbWindow.style.left = this.containerScroll().left * this.scrollRatio + 'px';
        this.thumbWindow.style.top = this.containerScroll().top * this.scrollRatio + 'px';
      }
    })


    /**
     *  zoom, page 전환등을 하는 경우
     *  1. scroll에 필요한 ratio 계산(thumbnail과 canvas의 크기비율)은 여기서 수행
     *  2. thumbnail의 window size 계산 수행
     */
    effect(() => {
      this.containerSize()
      if (this.thumbArray.length > 0) {
        this.scrollRatio = this.thumbArray[this.currentPage() - 1].width / this.containerSize().coverWidth;
        this.thumbWindowSize = {
          width: this.thumbArray[this.currentPage() - 1].width * this.containerSize().ratio.w + 'px',
          height: this.thumbArray[this.currentPage() - 1].height * this.containerSize().ratio.h + 'px'
        };
      }
    })


  }

  /**
  * 새로운 File Load (Local)
  * - @output으로 main component(white-board.component로 전달)
  * @param event
  * @returns
  */
  async handleUploadFileChanged(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (!inputElement || !inputElement.files || inputElement.files.length === 0) {
      return;
    }
    const file: File = inputElement.files[0];

    // 파일 유효성 검사
    const ext = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();

    if (ext !== 'pdf') {
      this.dialogService.openDialogNegative(`Please, upload the '.pdf' file.`);
      return;
    }


    this.pdfService.readFile(file)

    this.zoomService.setInitZoomScale()
  }


  /**
  * Thumbnail Click
  *
  * @param pageNum 페이지 번호
  * @returns
  */
  clickThumb(pageNum: number) {
    if (pageNum == this.currentPage()) return; // 동일 page click은 무시
    console.log('>> [clickThumb] change Page to : ', pageNum);
    this.currentPage.update(() => pageNum);

  }


  /**
   * 문서 Load에 따른 thumbnail 생성 및 Rendering
   *
   */
  async renderThumbnails() {

    this.thumbArray = [];

    for (let pageNum = 1; pageNum <= this.pdfLength(); pageNum++) {
      /*-----------------------------------------------------------
        1. get size of thumbnail canvas --> thumbnail element 생성.
        - width, height, scale return.
      --------------------------------------------------------------*/
      const thumbSize = this.canvasService.getThumbnailSize(pageNum);
      this.thumbArray.push(thumbSize);
    }

    await new Promise(res => setTimeout(res, 0));

    // Thumbnail Background (PDF)
    for (let i = 0; i < this.thumRef.toArray().length; i++) {
      await this.renderingService.renderThumbBackground(this.thumRef.toArray()[i].nativeElement, i + 1);
    };


  }

}

