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
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
// import { PeriodicElement } from '../../company-mngmt/company-list/company-list.component';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';

const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};


@Component({
  selector: 'app-country-holiday-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './country-holiday-add.component.html',
  styleUrls: ['./country-holiday-add.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class CountryHolidayAddComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // // view table
  displayedColumns: string[] = ['holidayName', 'holidayDate', 'btns'];
  holidayList: any;
  countryHolidayList: any;
  countryId: any;
  countryHolidayForm!: FormGroup<any>;
  // dataSource = ELEMENT_DATA;
  // private unsubscribe$ = new Subject<void>();
  // datePipe: any;

  constructor(
    private fb: FormBuilder,
    // public dialogRef: MatDialogRef<CountryHolidayAddComponent>, 이거때문에 안 뜸
    // @Inject(MAT_DIALOG_DATA) public data: any, // countryId 나라아이디
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private countryService: CountryService
  ) {
    this.countryId = this.route.snapshot.params['id'];
  }

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
          this.countryHolidayList = new MatTableDataSource(
            res.getCountryById.countryHoliday
          );
          this.countryHolidayList.paginator = this.paginator;
          this.holidayList = res.getCountryById.countryHoliday;
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

    if (this.holidayList) {
      // 휴가 중복 체크
      for (let i = 0; i < this.holidayList.length; i++) {
        if (this.holidayList[i].holidayDate == convertDate) {
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

  date = new FormControl(moment());

  chosenYearHandler(normalizedYear: moment.Moment, dp: any) {
    const ctrlValue = this.date.value!;
    ctrlValue.year();
    this.date.setValue(ctrlValue);
    dp.close();
    console.log(this.date.value, ctrlValue);
  }
}
