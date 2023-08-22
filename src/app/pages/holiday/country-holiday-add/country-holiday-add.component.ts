import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DialogService } from 'src/app/dialog/dialog.service';
import { CountryService } from 'src/app/services/leave/country/country.service';
import { PeriodicElement } from '../country-list/country-list.component';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { RouterModule } from '@angular/router';
// import { PeriodicElement } from '../../company-mngmt/company-list/company-list.component';

@Component({
  selector: 'app-country-holiday-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './country-holiday-add.component.html',
  styleUrls: ['./country-holiday-add.component.scss'],
})
export class CountryHolidayAddComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  // view table
  displayedColumns: string[] = ['holidayName', 'holidayDate', 'btns'];
  holidayList: any;
  countryHolidayList: any;
  countryHolidayForm!: FormGroup<any>;
  // dataSource = ELEMENT_DATA;
  private unsubscribe$ = new Subject<void>();
  datePipe: any;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CountryHolidayAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, // countryId 나라아이디
    private dialogService: DialogService,
    private countryService: CountryService
  ) {}

  ngOnInit(): void {
    this.countryHolidayForm = this.fb.group({
      holidayName: ['', [Validators.required]],
      holidayDate: ['', [Validators.required]],
    });
    this.getCountryHolidayList();
  }

  getCountryHolidayList() {
    this.countryService.getCountryInfo(this.data).subscribe({
      next: (data: any) => {
        console.log(data);
        if (data.message == 'getCountryById') {
          this.countryHolidayList = data.getCountryById.countryHoliday;
          this.holidayList = data.getCountryById.countryHoliday;
        }
        this.countryHolidayList = new MatTableDataSource<PeriodicElement>(
          data.getCountryById.countryHoliday
        );
        this.countryHolidayList.paginator = this.paginator;
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  // 국가 공휴일 추가
  addCountryHoliday() {
    // console.log('test')
    const formValue = this.countryHolidayForm.value;
    // const convertDate = this.datePipe.transform(
    //   formValue.holidayDate,
    //   'yyyy-MM-dd'
    // );
    const convertDate = moment(formValue.holidayDate).format('YYYY-MM-DD');
    const countryHolidayData = {
      _id: this.data.countryId,
      holidayName: formValue.holidayName,
      holidayDate: convertDate,
    };

    if(this.holidayList) {
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
        if (data.message == 'Success add country holiday') {
          this.dialogService.openDialogPositive('Success add country holiday.');
          this.getCountryHolidayList();
        }
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
      countryId: this.data.countryId,
      holidayId: _id,
    };
    console.log(countryHolidayData);
    this.countryService.deleteCountryHoliday(countryHolidayData).subscribe({
      next: (data: any) => {
        if (data.message == 'Success delete country holiday') {
          this.dialogService.openDialogPositive(
            'Success delete country holiday.'
          );
          this.getCountryHolidayList();
        }
      },
      error: (err: any) => {
        this.dialogService.openDialogNegative('An error has occured.');
      },
    });
  }

  datePickChange(dateValue: any) {
    this.countryHolidayForm.get('holidayDate')?.setValue(dateValue);
  }
}
