import { ElementRef, Injectable, effect, signal } from '@angular/core';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';


export interface PdfInfo {
  pdfDocument: PDFDocumentProxy,
  pdfPages: PDFPageProxy[],
}

const InitPdfInfo = {
  pdfDocument: {} as PDFDocumentProxy,
  pdfPages: []
}
@Injectable({
  providedIn: 'root'
})
export class PdfService {
  pdfInfo = signal<PdfInfo>(InitPdfInfo);
  pdfLength = signal<number>(0)
  currentPage = signal<number>(1)
  zoomScale = signal<number>(1)

  constructor() {
    effect(() => {
      console.log(this.pdfInfo())
    })
  }


  /**
   * arraybugger 형식으로 들어온 pdf를 pdfjs를 활용해 정보를 가져와
   * pdfDocument pdf 전체 정보와 destroy용
   * pdfPage pdf 개별 정보
   * 를 signal에 저장
   * @param pdfDocument pdf문서 데이터
   */
  async storePdfInfo(pdfDocument: PDFDocumentProxy) {
    const pdfPages: PDFPageProxy[] = [];
    // pdfDocument.numPages은 전체 pdf 문서 갯수
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      // 전체 pdf를 하나하나 보관
      const page = await pdfDocument.getPage(i);
      pdfPages.push(page);
    }
    // pdfInfo를 이전 상태(prev)와 병합하여 업데이트
    this.pdfInfo.update((prev) => ({
      ...prev,
      pdfDocument: pdfDocument,
      pdfPages: pdfPages,
    }));
    // pdf전체 길이 보관
    this.pdfLength.update(() => pdfDocument.numPages)
    // 현재 페이지 1로 초기화
    this.currentPage.set(1)
  }

  /**
   * 
   * @param pdfViewer 
   * @param isEditMode // isEditMode가 true 면, dialog에서 사용 중, 캔버스 크기가 다르다.
   */
  async pdfRender(pdfViewer: ElementRef<HTMLCanvasElement>, isEditMode: boolean) {

    console.log(this.pdfInfo())
    const page = await this.pdfInfo().pdfPages[this.currentPage() - 1]
    console.log(page)
    const viewport = page.getViewport({ scale: 1 });
    const canvas = pdfViewer.nativeElement;
    const context = canvas.getContext('2d')!;

    // Canvas의 크기와 내용 초기화
    this.clearCanvas(canvas)

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    // pdf 를 그려주는 canvas태그 최대 크기 지정
    canvas.style.maxWidth = 450 + 'px';
    canvas.style.maxHeight = 700 + 'px';
    if (isEditMode) {
      canvas.style.maxWidth = 330 + 'px';
      canvas.style.maxHeight = 450 + 'px';
    }
    const renderContext = {
      canvasContext: context!,
      viewport: viewport,
    };
    await page.render(renderContext);
  };

  /**
   * Canvas의 크기와 내용 초기화
   * @param canvas 
   */
  clearCanvas(
    canvas: HTMLCanvasElement,
  ) {
    canvas.width = 0;
    canvas.height = 0;
    const context = canvas.getContext('2d')!
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Memory Release
   * - pdf.js Destory for memory release
   * {@link https://github.com/mozilla/pdf.js/issues/9662 }
   * {@link https://stackoverflow.com/questions/40890212/viewer-js-pdf-js-memory-usage-increases-every-time-a-pdf-is-rendered?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa}
   */
  memoryRelease() {
    // console.log('PDF Memeory Release');

    if (this.pdfInfo()) {
      this.pdfInfo().pdfDocument.cleanup();
      this.pdfInfo().pdfDocument.destroy();
    }

    for (const pdfPage of this.pdfInfo().pdfPages) {
      pdfPage.cleanup();
    }
    // this.pdfInfo().pdfDocument = {} as PDFDocumentProxy;
    // this.pdfInfo().pdfPages = [];
    this.pdfInfo.update(() => {
      return {
        pdfDocument: {} as PDFDocumentProxy,
        pdfPages: []
      }
    })
  }

  /**
   * Update Zoom Scale
   * @param
   * @param Zoom
   */
  updateZoomScale(newZoomScale: number): void {
    this.zoomScale.update((prev) => newZoomScale)
  }


}

