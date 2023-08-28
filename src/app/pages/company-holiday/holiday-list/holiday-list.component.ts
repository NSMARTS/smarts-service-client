import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { DialogService } from 'src/app/dialog/dialog.service';
import { CompanyHolidayService } from 'src/app/services/company-holiday.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { HolidayAddComponent } from '../holiday-add/holiday-add.component';

// view table
export interface PeriodicElement {
  companyHolidayName: string;
  companyHolidayDate: string;
}

@Component({
  selector: 'app-holiday-list',
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
})
export class HolidayListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = [
    'companyHolidayName',
    'companyHolidayDate',
    'btns',
  ];
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

  openAddCompanuHoliday() {
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

  getCompanyHolidayList() {
    this.holidayMngmtService.getCompanyHolidayList(this.companyId).subscribe({
      next: (data: any) => {
        this.companyName = data.findCompanyHoliday.companyName;
        this.companyHolidayList = new MatTableDataSource<PeriodicElement>(
          data.findCompanyHoliday.companyHoliday
        );
        this.companyHolidayList.paginator = this.paginator;
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  deleteCompanyHoliday(companyHolidayId: any) {
    this.dialogService
      .openDialogConfirm('Do you want cancel this request?')
      .subscribe((result: any) => {
        if (result) {
          this.holidayMngmtService
            .deleteCompanyHoliday(this.companyId, companyHolidayId)
            .subscribe({
              next: () => {
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
