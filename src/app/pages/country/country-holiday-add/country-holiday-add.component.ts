import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DialogService } from 'src/app/dialog/dialog.service';
import { PeriodicElement } from '../country-list/country-list.component';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CountryService } from 'src/app/services/country.service';
// import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
// import {
//   MomentDateAdapter,
//   MAT_MOMENT_DATE_ADAPTER_OPTIONS,
// } from '@angular/material-moment-adapter';
import { MatYearView } from '@angular/material/datepicker';
import { CustomDateDirectiveModule } from './custom-date-directive.module';


// import { PeriodicElement } from '../../company-mngmt/company-list/company-list.component';
// import * as _moment from 'moment';
// // tslint:disable-next-line:no-duplicate-imports
// import { default as _rollupMoment, Moment } from 'moment';

// const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
// export const MY_FORMATS = {
//   parse: {
//     dateInput: 'YYYY',
//   },
//   display: {
//     dateInput: 'YYYY',
//     monthYearLabel: 'YYYY',
//     dateA11yLabel: 'LL',
//     monthYearA11yLabel: 'YYYY',
//   },
// };


@Component({
  selector: 'app-country-holiday-add',
  standalone: true,
  imports: [
    CommonModule,
    MaterialsModule,
    RouterModule,
    CustomDateDirectiveModule,
  ],
  templateUrl: './country-holiday-add.component.html',
  styleUrls: ['./country-holiday-add.component.scss'],
  // providers: [
  //   // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
  //   // application's root module. We provide it at the component level here, due to limitations of
  //   // our example generation script.
  //   {
  //     provide: DateAdapter,
  //     useClass: MomentDateAdapter,
  //     deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
  //   },

  //   { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  // ],
})
export class CountryHolidayAddComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // // view table
  displayedColumns: string[] = ['holidayName', 'holidayDate', 'btns'];
  countryHolidayList: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  wholeHolodayList: any;
  countryId: any;
  countryHolidayForm!: FormGroup<any>;
  currentYear = moment().year();
  minDate: Date = new Date(this.currentYear, 0, 1);
  maxDate: Date = new Date(this.currentYear, 11, 31);
  // dataSource = ELEMENT_DATA;
  // private unsubscribe$ = new Subject<void>();
  // datePipe: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private countryService: CountryService
  ) {
    this.countryId = this.route.snapshot.params['id'];
  }
  date = new FormControl(moment());

  ngOnInit(): void {
    this.countryHolidayForm = this.fb.group({
      holidayName: ['', [Validators.required]],
      holidayDate: ['', [Validators.required]],
    });
    this.getCountryHolidayList();
  }

  getCountryHolidayList() {
    this.countryService
      .getCountryInfo({ countryId: this.countryId })
      .subscribe({
        next: (res: any) => {
          this.wholeHolodayList = res.getCountryById.countryHoliday.sort(
            (a: any, b: any) =>
              new Date(a.holidayDate).getTime() -
              new Date(b.holidayDate).getTime()
          );
          const ctrlValue = this.date.value!;
          console.log(this.wholeHolodayList, ctrlValue.year());
          this.applyFilterYear(ctrlValue.year());
          this.countryHolidayList.paginator = this.paginator;
        },
        error: (err: any) => {
          console.log(err.error.message);
        },
      });
  }

  // 국가 공휴일 추가
  addCountryHoliday() {
    const formValue = this.countryHolidayForm.value;
    const convertDate = moment(formValue.holidayDate).format('YYYY-MM-DD');
    const countryHolidayData = {
      _id: this.countryId,
      holidayName: formValue.holidayName,
      holidayDate: convertDate,
    };
    console.log(countryHolidayData);

    if (this.wholeHolodayList) {
      // 휴가 중복 체크
      for (let i = 0; i < this.wholeHolodayList.length; i++) {
        if (this.wholeHolodayList[i].holidayDate == convertDate) {
          // this.dialogRef.close();
          return this.dialogService.openDialogNegative(
            'The holiday is duplicated.'
          );
        }
      }
    }

    this.countryService.addCountryHoliday(countryHolidayData).subscribe({
      next: (data: any) => {
        this.dialogService.openDialogPositive('Success add country holiday.');
        this.getCountryHolidayList();
      },
      error: (err: any) => {
        this.dialogService.openDialogNegative('An error has occured.');
        this.getCountryHolidayList();
      },
    });
  }

  // 국가 공휴일 삭제
  deleteCountryHoliday(_id: any) {
    const countryHolidayData = {
      countryId: this.countryId,
      holidayId: _id,
    };
    console.log(countryHolidayData);
    this.countryService.deleteCountryHoliday(countryHolidayData).subscribe({
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

  datePickChange(dateValue: any) {
    this.countryHolidayForm.get('holidayDate')?.setValue(dateValue);
  }

  chosenYearHandler(normalizedYear: any, dp: any) {
    dp.close();
    const ctrlValue = this.date.value!;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
    this.applyFilterYear(ctrlValue.year());
    this.currentYear = ctrlValue.year();
    console.log(this.currentYear);
  }

  applyFilterYear(year: number) {
    this.countryHolidayList.data = this.wholeHolodayList.filter(
      (e: any) => new Date(e.holidayDate).getUTCFullYear() === year
    );
    console.log(this.countryHolidayList);
    this.minDate = new Date(year, 0, 1);
    this.maxDate = new Date(year, 11, 31);
    this.datePickChange(null);
  }
}
