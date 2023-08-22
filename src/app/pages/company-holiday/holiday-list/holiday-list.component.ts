import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from 'src/app/dialog/dialog.service';
import { CompanyHolidayService } from 'src/app/services/company-holiday.service';
import { DataService } from 'src/app/stores/data/data.service';
import { HolidayAddComponent } from '../holiday-add/holiday-add.component';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';

// view table
export interface PeriodicElement {
  ch_name: string;
  ch_date: string;
}

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './holiday-list.component.html',
  styleUrls: ['./holiday-list.component.scss'],
})
export class HolidayListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // view table
  displayedColumns: string[] = ['ch_name', 'ch_date', 'btns'];

  // replacement day requests

  companyHolidayList: any = new MatTableDataSource();
  company: any;
  manager: any;
  userInfo: any;
  // dataSource = ELEMENT_DATA;
  private unsubscribe$ = new Subject<void>();

  companyId: any;

  constructor(
    public dataService: DataService,
    public dialog: MatDialog,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private holidayMngmtService: CompanyHolidayService
  ) {}

  ngOnInit(): void {
    this.dataService.userCompanyProfile
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: any) => {
          this.company = data;
        },
        (err: any) => {
          console.log(err);
        }
      );

    this.dataService.userManagerProfile
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: any) => {
          this.manager = data;
        },
        (err: any) => {
          console.log(err);
        }
      );

    this.dataService.userProfile.pipe(takeUntil(this.unsubscribe$)).subscribe(
      (data: any) => {
        this.userInfo = data;
      },
      (err: any) => {
        console.log(err);
      }
    );

    this.companyId = this.route.snapshot.params['id'];

    this.getCompanyHolidayList();
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

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getCompanyHolidayList() {
    this.holidayMngmtService.getCompanyHolidayList(this.companyId).subscribe({
      next: (data: any) => {
        console.log(data);
        if (data.message == 'Success find company holiday') {
          this.companyHolidayList = data.findCompanyHoliday.company_holiday;
          console.log(this.companyHolidayList);
        }
        this.companyHolidayList = new MatTableDataSource<PeriodicElement>(
          data.findCompanyHoliday.company_holiday
        );
        console.log(this.companyHolidayList);
        this.companyHolidayList.paginator = this.paginator;
        console.log(this.companyHolidayList.paginator);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  deleteCompanyHoliday(companyHolidayId: any) {
    console.log(companyHolidayId);
    const ch_id = {
      _id: companyHolidayId,
    };

    this.dialogService
      .openDialogConfirm('Do you want cancel this request?')
      .subscribe((result: any) => {
        if (result) {
          this.holidayMngmtService
            .deleteCompanyHoliday(this.companyId, companyHolidayId)
            .subscribe(
              (data: any) => {
                console.log(data);
                if (data.message == 'Success delete company holiday') {
                  this.getCompanyHolidayList();
                }
              },
              (err: any) => {
                if (err.error.message == 'Deleting company holiday Error') {
                  this.dialogService.openDialogNegative(
                    'An error has occurred.'
                  );
                }
              }
            );
        }
      });
  }

  //   editCompanyHoliday(companyHolidayId: any) {
  //     const ch_id = {
  //       _id: companyHolidayId,
  //     };

  //     const dialogRef = this.dialog.open(HolidayAddComponent, {
  //       data: {
  //         companyHolidayList: this.companyHolidayList,
  //       },
  //     });

  //     dialogRef.afterClosed().subscribe((result) => {
  //       this.getCompanyHolidayList();
  //     });
  //   }
}
