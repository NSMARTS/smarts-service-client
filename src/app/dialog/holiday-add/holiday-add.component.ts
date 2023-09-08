import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyHolidayService } from 'src/app/services/company-holiday.service';

@Component({
  selector: 'app-holiday-add',
  templateUrl: './holiday-add.component.html',
  styleUrls: ['./holiday-add.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
})
export class HolidayAddComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['companyHolidayName', 'companyHolidayDate'];
  companyHolidayForm!: FormGroup;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<HolidayAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogService: DialogService,
    private CompanyHolidayService: CompanyHolidayService
  ) {}

  ngOnInit(): void {
    this.companyHolidayForm = this.fb.group({
      holidayName: ['', [Validators.required]],
      holidayDate: ['', [Validators.required]],
    });
  }

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit() {
    if (this.hasErrors()) {
      //유효성 검사 실패 시 빨갛게 나옴
    } else {
      // 유효성 검사 통과 시
      this.addCompanyHoliday();
    }
  }

  addCompanyHoliday() {
    const formValue = this.companyHolidayForm.value;
    const convertDate = moment(formValue.holidayDate).format('YYYY-MM-DD');
    const companyHolidayData = {
      companyHolidayName: formValue.holidayName,
      companyHolidayDate: convertDate,
    };

    this.CompanyHolidayService.addCompanyHoliday(
      this.data.compnayId,
      companyHolidayData
    ).subscribe({
      next: () => {
        this.dialogRef.close();
        this.dialogService.openDialogPositive(
          'Successfully, a holiday has been added.'
        );
      },
      error: (err) => {
        console.error(err);
        if (err.status === 409) {
          this.dialogService.openDialogNegative(
            'Company Holiday date is duplicated.'
          );
        } else {
          this.dialogService.openDialogNegative('Adding company holiday Error');
        }
      },
    });
  }

  datePickChange(dateValue: any) {
    this.companyHolidayForm.get('holidayDate')?.setValue(dateValue);
  }

  // 유효성 검사 함수
  private hasErrors() {
    const holidayNameError = this.companyHolidayForm
      .get('holidayName')
      ?.hasError('required');
    const holidayDateError = this.companyHolidayForm
      .get('holidayDate')
      ?.hasError('required');

    return holidayNameError || holidayDateError;
  }
}
