import { ElementRef, Injectable, effect, signal } from '@angular/core';
import { PDFDocumentProxy } from 'pdfjs-dist';

export interface PdfDocument {
  pdf: PDFDocumentProxy,
  pdfLength: number,
  currentPage: number,
}



@Injectable({
  providedIn: 'root'
})
export class PdfService {
  pdfDocument = signal<PDFDocumentProxy>({} as PDFDocumentProxy)
  pdfLength = signal<number>(0)
  currentPage = signal<number>(1)

  constructor() {
    effect(() => {
      console.log(this.pdfDocument())
    })
  }

  /**
   * 
   * @param pdfViewer 
   * @param isEditMode // isEditMode가 true 면, dialog에서 사용 중, 캔버스 크기가 다르다.
   */
  async pdfRender(pdfViewer: ElementRef<HTMLCanvasElement>, isEditMode: boolean) {
    console.log(isEditMode)
    const page = await this.pdfDocument().getPage(this.currentPage())
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
    page.render(renderContext);
  };

  clearCanvas(
    canvas: HTMLCanvasElement,
  ) {
    // Canvas의 크기와 내용 초기화
    canvas.width = 0;
    canvas.height = 0;
    const context = canvas.getContext('2d')!
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
}

