import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCanvasComponent } from './white-board/board-canvas/board-canvas.component';
import { BoardNavComponent } from './white-board/board-nav/board-nav.component';
import { BoardSlideComponent } from './white-board/board-slide/board-slide.component';
import { BoardFabsComponent } from './white-board/board-fabs/board-fabs.component';
import { ActivatedRoute } from '@angular/router';
import { PdfService } from 'src/app/services/pdf/pdf.service';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = './assets/lib/build/pdf.worker.js';

@Component({
  selector: 'app-contract-add',
  standalone: true,
  imports: [
    CommonModule,
    BoardCanvasComponent,
    BoardFabsComponent,
    BoardNavComponent,
    BoardSlideComponent
  ],
  templateUrl: './contract-add.component.html',
  styleUrls: ['./contract-add.component.scss']
})
export class ContractAddComponent {

  route = inject(ActivatedRoute)
  pdfService = inject(PdfService)
  // fileService = inject(FileService)
  // zoomService = inject(ZoomService)

  constructor() {
    effect(() => {

    })
  }



  /**
     * Open Local PDF File
     *  - Board File View Component의 @output
     *  - File upload
     *
     * @param newDocumentFile
     */
  async onDocumentOpened(event: Event) {

    // this.pdfService.memoryRelease();
    // if (event.target.files && event.target.files[0]) {
    //   if (event.target.files[0].name.toLowerCase().endsWith('.pdf')) {
    //     // Image resize and update

    //     this.isLoadingResults = true;
    //     const file: File = event.target.files[0];
    // const loadingTask = pdfjsLib.getDocument({ data: event });
    // const pdfDocument = await loadingTask.promise
    // // PDF 정보를 가져옴
    // await this.pdfService.storePdfInfo(pdfDocument);
    // const numPages = await this.pdfService.storePdfInfo(newDocumentFile);


    // // console.log(this.pdfService.pdfVar);
    // const obj = {
    //   isDocLoaded: true,
    //   loadedDate: new Date().getTime(),
    //   numPages: numPages,
    //   currentPage: 1,
    //   zoomScale: this.zoomService.setInitZoomScale()
    // };

    // this.viewInfoService.setViewInfo(obj);
  }

}
