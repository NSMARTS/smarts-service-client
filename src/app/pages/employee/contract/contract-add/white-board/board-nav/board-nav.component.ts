import { lastValueFrom } from 'rxjs';
import { Component, OnInit, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { PdfInfo, PdfService } from 'src/app/services/pdf.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { MatIconModule } from '@angular/material/icon';
import { DialogService } from 'src/app/services/dialog.service';
import { ContractAddDialogComponent } from 'src/app/dialog/contract-dialog/contract-add-dialog/contract-add-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, UserInfo } from 'src/app/services/auth.service';
import { ContractService } from 'src/app/services/contract.service';
import { ContractDetailDialogComponent } from 'src/app/dialog/contract-dialog/contract-detail-dialog/contract-detail-dialog.component';

@Component({
  selector: 'app-board-nav',
  standalone: true,
  imports: [CommonModule, MaterialsModule],
  templateUrl: './board-nav.component.html',
  styleUrls: ['./board-nav.component.scss']
})
export class BoardNavComponent {

  // 의존성 주입 -------------------------
  router = inject(Router)
  route = inject(ActivatedRoute)
  dialog = inject(MatDialog)

  dialogService = inject(DialogService)
  pdfService = inject(PdfService)
  authService = inject(AuthService)
  contractService = inject(ContractService)

  // 변수 선언 -------------------------
  companyId: string;
  contractId: string;
  contractInfo: any;
  contract: any;

  // 상태관리 --------------------------
  pdfInfo: WritableSignal<PdfInfo> = this.pdfService.pdfInfo;
  pdfLength: WritableSignal<number> = this.pdfService.pdfLength;
  currentPage: WritableSignal<number> = this.pdfService.currentPage;

  userInfoStore: WritableSignal<UserInfo> = this.authService.userInfoStore;
  contractMod: WritableSignal<string> = this.contractService.contractMod;


  constructor() {
    this.companyId = this.route.snapshot.params['id'];
    this.contractId = this.route.snapshot.params['contractId'];
    this.contractMod.set(this.route.snapshot.url[0].path)
    this.getPdf()
  }

  async getPdf() {
    if (this.contractMod() === 'edit' || this.contractMod() === 'detail') {
      this.contractInfo = await lastValueFrom(this.contractService.getContract(this.companyId, this.contractId))
      this.contract = await lastValueFrom(this.contractService.downloadPdf(this.contractInfo.data.key))
      this.pdfService.readFile(this.contract)
    }
  }

  // back page
  backPage() {
    this.router.navigate([`/company/${this.companyId}/contract`]);
  }

  // modal Contract save
  openSaveContract() {

    const convertDate = moment().format("YYYY-MM-DD")
    if (this.pdfInfo().pdfPages.length === 0) {
      this.dialogService.openDialogNegative('The contract document does not exist. Try again.');
    } else {
      const dialogRef = this.dialog.open(ContractAddDialogComponent, {
        data: {
          companyId: this.companyId,
          date: convertDate,
        }
      });

      dialogRef.afterClosed().subscribe((data) => {

      })
    }
  }

  openDetailContract() {
    const dialogRef = this.dialog.open(ContractDetailDialogComponent, {
      data: {
        ...this.contractInfo.data,
        companyId: this.companyId,

      }
    });
  }
}
