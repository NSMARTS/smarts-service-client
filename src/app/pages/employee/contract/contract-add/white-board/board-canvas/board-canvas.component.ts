import { PdfInfo, PdfService } from '../../../../../../services/pdf/pdf.service';
import { Component, ElementRef, Input, OnDestroy, OnInit, Renderer2, ViewChild, WritableSignal, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CANVAS_CONFIG } from 'src/app/config/canvas-css';
import { CanvasService } from 'src/app/services/canvas/canvas.service';
import { DragScrollDirective } from 'src/app/directives/drag-scroll.directive';
import { ContainerScroll, ContainerSize } from 'src/app/interfaces/white-board.interface';
import { RenderingService } from 'src/app/services/rendering/rendering.service';

@Component({
  selector: 'app-board-canvas',
  standalone: true,
  imports: [
    CommonModule,
    DragScrollDirective
  ],
  templateUrl: './board-canvas.component.html',
  styleUrls: ['./board-canvas.component.scss']
})
export class BoardCanvasComponent implements OnInit, OnDestroy {

  canvasService = inject(CanvasService)
  pdfService = inject(PdfService)
  renderingService = inject(RenderingService)
  renderer = inject(Renderer2)

  rendererEvent!: () => void;

  pdfInfo: WritableSignal<PdfInfo> = this.pdfService.pdfInfo; // 업로드한 pdf 
  pdfLength: WritableSignal<number> = this.pdfService.pdfLength; // pdf 전체 길이
  currentPage: WritableSignal<number> = this.pdfService.currentPage; // 현재 페이지
  zoomScale: WritableSignal<number> = this.pdfService.zoomScale; // 줌 비율

  // 사이드 바 썸네일 윈도우 좌표
  containerScroll: WritableSignal<ContainerScroll> = this.canvasService.containerScroll
  // 사이드 바 썸네일 윈도우 크기
  containerSize: WritableSignal<ContainerSize> = this.canvasService.containerSize

  @ViewChild('canvasContainer', { static: true }) public canvasContainerRef!: ElementRef;
  @ViewChild('bg', { static: true }) public bgCanvasRef!: ElementRef;
  @ViewChild('tmp', { static: true }) public tmpCanvasRef!: ElementRef;

  canvasContainer!: HTMLDivElement;
  bgCanvas!: HTMLCanvasElement;
  tmpCanvas!: HTMLCanvasElement;

  constructor() {
    // pdf 변경, 혹은 page 변경 시 onChangePage
    effect(() => {
      this.currentPage()
      if (this.pdfInfo().pdfPages.length > 0) {
        this.onChangePage();
      }
      // allowSignalWrites effect() 안에 시그널 변수를 
      // 변경(set, update, mutate)하고 싶은 경우.
    }, { allowSignalWrites: true })


  }

  ngOnInit(): void {
    this.initCanvasSet();
    this.rendererEvent = this.renderer.listen(this.canvasContainer, 'scroll', event => {
      this.onScroll();
    });
  }

  ngOnDestroy(): void {
    this.pdfService.memoryRelease();
    // render listener 해제
    this.rendererEvent();
  }

  /**
 * 초기 Canvas 변수, Container Size 설정
 */
  initCanvasSet() {
    this.bgCanvas = this.bgCanvasRef.nativeElement;
    this.tmpCanvas = this.tmpCanvasRef.nativeElement;
    this.canvasContainer = this.canvasContainerRef.nativeElement;

    /* container size 설정 */
    CANVAS_CONFIG.maxContainerHeight = window.innerHeight - CANVAS_CONFIG.toolbarHeight - CANVAS_CONFIG.navHeight; // pdf 불러오기 사이즈
    CANVAS_CONFIG.maxContainerWidth = window.innerWidth - CANVAS_CONFIG.sidebarWidth;

    CANVAS_CONFIG.deviceScale = this.canvasService.getDeviceScale(this.bgCanvas);
  }
  /**
     *  판서 + background drawing
     */

  /**
   * draw + pdf rendering
   *
   * @param currentDocNum
   * @param currentPage
   * @param zoomScale
   */
  pageRender(currentPage: number, zoomScale: number) {

    // zoomIn 시 UI 측면 화면 깜빡임 방지 함수.
    this.preRenderBackground(currentPage)

    console.log('>>> page Render!');
    // PDF Rendering
    this.renderingService.renderBackground(this.tmpCanvas, this.bgCanvas, currentPage);
  }


  /**
   * Background pre rendering
   * - Main bg를 그리기 전에 thumbnail image 기준으로 배경을 미리 그림.
   * - UI 측면의 효과
   * @param pageNum page 번호
   */
  async preRenderBackground(pageNum: number) {
    console.log(pageNum)
    const targetCanvas = this.bgCanvas

    const ctx = targetCanvas.getContext("2d")!;
    const imgElement: any = document.getElementById('thumb' + pageNum);

    /**************************************************
    * 처음 화이트보드에 들어오면 document.getElementById('thumb_' + pageNum) (이미지)가 정의되지 않아 오류가 난다.
    * 그래서 img가 null일 시 return 하여 오류 방지
    ****************************************************/
    if (imgElement == null) {
      return
    }

    ctx.drawImage(imgElement, 0, 0, targetCanvas.width, targetCanvas.height);
  }


  /**
   * 창 크기 변경시
   *
   */
  onResize() {
    if (!this.pdfInfo().pdfDocument) return console.log(this.pdfInfo().pdfDocument);

    // Resize시 container size 조절.
    const ratio = this.canvasService.setContainerSize(this.canvasContainer);

    this.containerSize.update(() => {
      return {
        ratio,
        coverWidth: this.canvasService.canvasFullSize.width,
      }
    })
  }

  /**
   * Scroll 발생 시
   */
  onScroll() {
    if (!this.pdfInfo().pdfDocument) return;

    this.containerScroll.update(() => {
      return {
        left: this.canvasContainer.scrollLeft,
        top: this.canvasContainer.scrollTop
      }
    })
  }


  /**
     * change Page : 아래 사항에 대해 공통으로 사용
     * - 최초 Load된 경우
     * - 페이지 변경하는 경우
     * - 문서 변경하는 경우
     * - scale 변경하는 경우
     */
  onChangePage() {

    console.log(`>> changePage to page: ${this.currentPage()}, scale: ${this.zoomScale()} `);

    // set Canvas Size
    const ratio = this.canvasService.setCanvasSize(this.currentPage(), this.zoomScale(), this.canvasContainer, this.bgCanvas);

    // BG & Board Render
    this.pageRender(this.currentPage(), this.zoomScale());

    // Thumbnail window 조정

    this.containerSize.update(() => {
      return {
        ratio,
        coverWidth: this.canvasService.canvasFullSize.width,
      }
    })

    // scroll bar가 있는 경우 page 전환 시 초기 위치로 변경
    this.canvasContainer.scrollTop = 0;
    this.canvasContainer.scrollLeft = 0;
  };

}
