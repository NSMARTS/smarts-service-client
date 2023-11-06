import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { CompanyHolidayService } from 'src/app/services/company-holiday.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { HolidayAddComponent } from '../../../dialog/holiday-add/holiday-add.component';

// view table
export interface PeriodicElement {
  companyHolidayName: string;
  companyHolidayDate: string;
}

@Component({
  selector: 'app-holiday',
  templateUrl: './holiday.component.html',
  styleUrls: ['./holiday.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
})
export class HolidayComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['date', 'name', 'delete'];
  companyHolidayList: any = new MatTableDataSource();
  private unsubscribe$ = new Subject<void>();
  companyId: any;
  companyName: any;

  constructor(
    public dialog: MatDialog,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private holidayMngmtService: CompanyHolidayService
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.getCompanyHolidayList();
  }

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // 회사 공휴일 추가 dialog 오픈
  openAddCompanyHoliday() {
    const dialogRef = this.dialog.open(HolidayAddComponent, {
      data: {
        companyHolidayList: this.companyHolidayList,
        compnayId: this.companyId,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getCompanyHolidayList();
    });
  }

  // 회사 공휴일 목록 조회
  getCompanyHolidayList() {
    this.holidayMngmtService.getCompanyHolidayList(this.companyId).subscribe({
      next: (data: any) => {
        this.companyName = data.companyHolidaies.companyName;
        this.companyHolidayList = new MatTableDataSource<PeriodicElement>(
          data.companyHolidaies.companyHoliday
        );
        this.companyHolidayList.paginator = this.paginator;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  // 회사 공휴일 삭제
  deleteCompanyHoliday(HolidayId: any) {
    this.dialogService
      .openDialogConfirm('Do you want delete this holiday?')
      .subscribe((result: any) => {
        if (result) {
          this.holidayMngmtService
            .deleteCompanyHoliday(this.companyId, HolidayId)
            .subscribe({
              next: () => {
                this.dialogService.openDialogPositive(
                  'Successfully, the holiday has been delete.'
                );
                this.getCompanyHolidayList();
              },
              error: (err: any) => {
                console.error(err);
                this.dialogService.openDialogNegative('An error has occurred.');
              },
            });
        }
      });
  }

  // 회사 공휴일 필터
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.companyHolidayList.filter = filterValue.trim().toLowerCase();

    if (this.companyHolidayList.paginator) {
      this.companyHolidayList.paginator.firstPage();
    }
  }
}
