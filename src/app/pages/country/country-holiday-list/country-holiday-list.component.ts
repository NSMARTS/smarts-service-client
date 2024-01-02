import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CountryService } from 'src/app/services/country/country.service';
import { CustomDateDirectiveModule } from './custom-date-directive.module';
import { CountryHolidayAddComponent } from 'src/app/dialog/country-holiday-add/country-holiday-add.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-country-holiday-list',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,
    RouterModule,
    CustomDateDirectiveModule,
  ],
  templateUrl: './country-holiday-list.component.html',
  styleUrls: ['./country-holiday-list.component.scss'],
})
export class CountryHolidayListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // // view table
  displayedColumns: string[] = ['holidayDate', 'holidayName', 'delete'];
  countryHolidayList: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  wholeHolidayList: any;
  countryId: any;
  countryName: any;

  currentYear = moment().year();
  minDate: Date = new Date(this.currentYear, 0, 1);
  maxDate: Date = new Date(this.currentYear, 11, 31);

  constructor(
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private countryService: CountryService,
    public dialog: MatDialog
  ) {
    this.countryId = this.route.snapshot.params['id'];
    this.route.queryParams.subscribe((params) => {
      this.countryName = params['name'];
    });
  }
  date = new FormControl(moment());

  ngOnInit(): void {
    this.getCountryHolidayList();
  }

  getCountryHolidayList() {
    this.countryService
      .getCountryInfo({ countryId: this.countryId })
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.wholeHolidayList = res.getCountryById.countryHoliday.sort(
            (a: any, b: any) =>
              new Date(a.holidayDate).getTime() -
              new Date(b.holidayDate).getTime()
          );
          const ctrlValue = this.date.value!;
          this.applyFilterYear(ctrlValue.year());
          this.countryHolidayList.paginator = this.paginator;
        },
        error: (err: any) => {
          console.log(err.error.message);
        },
      });
  }

  // // 국가 공휴일 추가
  // addCountryHoliday() {
  //   const formValue = this.countryHolidayForm.value;
  //   const convertDate = moment(formValue.holidayDate).format('YYYY-MM-DD');
  //   const countryHolidayData = {
  //     _id: this.countryId,
  //     holidayName: formValue.holidayName,
  //     holidayDate: convertDate,
  //   };
  //   console.log(countryHolidayData);

  //   if (this.wholeHolidayList) {
  //     // 휴가 중복 체크
  //     for (let i = 0; i < this.wholeHolidayList.length; i++) {
  //       if (this.wholeHolidayList[i].holidayDate == convertDate) {
  //         // this.dialogRef.close();
  //         return this.dialogService.openDialogNegative(
  //           'The holiday is duplicated.'
  //         );
  //       }
  //     }
  //   }

  //   this.countryService.addCountryHoliday(countryHolidayData).subscribe({
  //     next: (data: any) => {
  //       this.dialogService.openDialogPositive('Success add country holiday.');
  //       this.getCountryHolidayList();
  //     },
  //     error: (err: any) => {
  //       this.dialogService.openDialogNegative('An error has occured.');
  //       this.getCountryHolidayList();
  //     },
  //   });
  // }

  openAddHoliday() {
    const dialogRef = this.dialog.open(CountryHolidayAddComponent, {
      data: {
        countryId: this.countryId,
        wholeHolidayList: this.wholeHolidayList,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getCountryHolidayList();
    });
  }

  // 국가 공휴일 삭제
  deleteCountryHoliday(_id: any) {
    const countryHolidayData = {
      countryId: this.countryId,
      holidayId: _id,
    };
    console.log(countryHolidayData);

    this.dialogService
      .openDialogConfirm('Do you delete this country holiday?')
      .subscribe((result: any) => {
        if (result) {
          this.countryService
            .deleteCountryHoliday(countryHolidayData)
            .subscribe({
              next: (data: any) => {
                this.dialogService.openDialogPositive(
                  'Success delete country holiday.'
                );
                this.getCountryHolidayList();
              },
              error: (err: any) => {
                this.dialogService.openDialogNegative('An error has occured.');
              },
            });
        }
      });
  }

  // datePickChange(dateValue: any) {
  //   this.countryHolidayForm.get('holidayDate')?.setValue(dateValue);
  // }

  chosenYearHandler(normalizedYear: any, dp: any) {
    dp.close();
    const ctrlValue = this.date.value!;
    ctrlValue.year(normalizedYear.year());

    this.date.setValue(ctrlValue);
    this.applyFilterYear(ctrlValue.year());
    this.currentYear = ctrlValue.year();
  }

  applyFilterYear(year: number) {
    this.countryHolidayList.data = this.wholeHolidayList.filter(
      (e: any) => new Date(e.holidayDate).getUTCFullYear() === year
    );
    console.log(this.countryHolidayList);
    this.minDate = new Date(year, 0, 1);
    this.maxDate = new Date(year, 11, 31);
    // this.datePickChange(null);
  }
}
