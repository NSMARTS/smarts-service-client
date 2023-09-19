import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CountryService } from 'src/app/services/country.service';
import * as moment from 'moment';

@Component({
  selector: 'app-country-holiday-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './country-holiday-add.component.html',
  styleUrls: ['./country-holiday-add.component.scss'],
})
export class CountryHolidayAddComponent implements OnInit {
  // form group
  countryHolidayForm!: FormGroup<any>;
  route = inject(ActivatedRoute);
  countryId: any;
  wholeHolidayList: any;
  currentYear = moment().year();

  constructor(
    private fb: FormBuilder,
    private dialogService: DialogService,
    private countryService: CountryService,
    public dialogRef: MatDialogRef<CountryHolidayAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.countryId = data.countryId;
    this.wholeHolidayList = data.wholeHolidayList;
  }

  date = new FormControl(moment());

  ngOnInit(): void {
    console.log(this.countryId);

    this.countryHolidayForm = this.fb.group({
      holidayName: ['', [Validators.required]],
      holidayDate: ['', [Validators.required]],
    });
  }

  datePickChange(dateValue: any) {
    this.countryHolidayForm.get('holidayDate')?.setValue(dateValue);
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

    if (this.wholeHolidayList) {
      // 휴가 중복 체크
      for (let i = 0; i < this.wholeHolidayList.length; i++) {
        if (this.wholeHolidayList[i].holidayDate == convertDate) {
          // this.dialogRef.close();
          return this.dialogService.openDialogNegative(
            'The holiday is duplicated.'
          );
        }
      }
    }

    this.countryService.addCountryHoliday(countryHolidayData).subscribe({
      next: (data: any) => {
        this.dialogRef.close();
        this.dialogService.openDialogPositive('Success add country holiday.');
      },
      error: (err: any) => {
        this.dialogRef.close();
        this.dialogService.openDialogNegative('An error has occured.');
      },
    });
  }
}