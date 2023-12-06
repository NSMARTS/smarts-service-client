import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor() { }

  //   /**
  //  * PDF File Open
  //  * @param aFile
  //  * @returns
  //  */
  //   async openDoc(aFile) {

  //     console.log('>> open PDF File');

  //     const file = await this.readFile(aFile);

  //     const pdfVar: any = {};

  //     pdfVar.fileBuffer = file;
  //     const results = await this.pdfConvert(file);

  //     pdfVar.pdfPages = results.pdfPages; //pdf 문서의 page별 정보
  //     pdfVar.pdfDestroy = results.pdfDoc;
  //     // console.log(pdfVar);
  //     this.pdfStorageService.setPdfVar(pdfVar);
  //     console.log(pdfVar)

  //     return results.pdfPages.length;
  // }

}
