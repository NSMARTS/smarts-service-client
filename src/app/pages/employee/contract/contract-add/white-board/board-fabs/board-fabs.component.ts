import { ZoomService } from './../../../../../../services/zoom.service';
import { PdfService } from './../../../../../../services/pdf.service';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';

@Component({
  selector: 'app-board-fabs',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,

  ],
  templateUrl: './board-fabs.component.html',
  styleUrls: ['./board-fabs.component.scss']
})
export class BoardFabsComponent {

  pdfService = inject(PdfService)
  zoomService = inject(ZoomService)

  /**
    * Zoom Button에 대한 동작
    * - viewInfoService의 zoomScale 값 update
    *
    * @param action : 'fitToWidth' , 'fitToPage', 'zoomIn', 'zoomOut'
    */
  clickZoom(action: any) {
    console.log(">> Click Zoom: ", action);

    const currentPage = this.pdfService.currentPage;
    const prevZoomScale = this.pdfService.zoomScale;

    console.log(currentPage, prevZoomScale)

    const newZoomScale = this.zoomService.calcZoomScale(action, currentPage(), prevZoomScale());

    this.pdfService.updateZoomScale(newZoomScale);

  }

}
