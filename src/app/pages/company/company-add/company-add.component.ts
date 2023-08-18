import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

//table page
import * as moment from 'moment';
// import { DialogService } from 'src/@dw/dialog/dialog.service';

import { Subject } from 'rxjs';

import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CompanyService } from 'src/app/services/leave/company/company.service';
import { DataService } from 'src/app/stores/data/data.service';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';

@Component({
  selector: 'app-company-add',
  //   standalone: true,
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './company-add.component.html',
  styleUrls: ['./company-add.component.scss'],
})
export class CompanyAddComponent implements OnInit {
  days: any;
  start_date_sec: any;
  end_date_sec: any;
  millisecondsPerDay: any;
  diff: any;
  weeks: any;
  leaveDays: any;
  leave_standard: FormArray | undefined;
  addCompanyForm = new FormGroup<any>({
    company_name: new FormControl(''),
    // annual_leave: new FormControl(''),
    // sick_leave: new FormControl(''),
    // replacement_leave: new FormControl(''),
    leave_standard: this.formBuilder.array([this.createItem()]),
    isRollover: new FormControl(''),
    rollover_max_month: new FormControl(''),
    rollover_max_day: new FormControl(''),
    country_code: new FormControl(''),
    location: new FormControl(''),
    isReplacementDay: new FormControl(''),
    isMinusAnnualLeave: new FormControl(''),
    rd_validity_term: new FormControl(''),
    annual_policy: new FormControl(''),
  });

  rolloverMinDate: any;
  rolloverMaxDate: any;
  minDate = ''; // rollover 제한
  maxDate = ''; // rollover 제한
  isRollover = false; // rollover 제한
  myInfo: any;

  // 원하는 총 휴가 기간
  leaveDuration: any;
  isHalf: boolean | undefined;
  leaveRequestData: any;
  leaveInfo: any;
  company: any;
  // 달력 주말 필터
  holidayList = [
    '2022-01-31',
    '2022-02-01',
    '2022-02-02',
    '2022-03-01',
    '2022-03-09',
    '2022-05-05',
    '2022-06-01',
    '2022-06-06',
    '2022-08-15',
    '2022-09-09',
    '2022-09-12',
    '2022-10-03',
    '2022-10-10',
  ];
  holidayDateFilter = (d: Date): any => {
    if (d == null) {
      return;
    }
    const day = d.getDay();
    // check if date is weekend day
    if (day === 0 || day === 6) {
      return false;
    }

    // check if date is holiday
    let s = moment(d);
    if (this.holidayList) {
      return !this.holidayList.find((x) => {
        return moment(x).isSame(s, 'day');
      });
    }
  };

  RolloverDateFilter() {
    console.log('11111111111');
  }
  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private router: Router,
    // private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService
  ) {}

  getControls() {
    return (this.addCompanyForm.get('leave_standard') as FormArray).controls;
  }

  ngOnInit(): void {
    console.log(
      (this.addCompanyForm.get('leave_standard') as FormArray).controls
    );
    this.minDate = '';

    this.dataService.userProfile.subscribe((res: any) => {
      // console.log('request-leave dataService data >>>', res);
      this.myInfo = res;
    });
  }

  //////////////////////////////////
  createItem(): FormGroup {
    return this.formBuilder.group({
      year: '',
      annual_leave: '',
      sick_leave: '',
      replacement_leave: '',
      rollover: '',
    });
  }

  // Leave Standard
  groups = [
    {
      year: '',
      annual_leave: '',
      sick_leave: '',
      replacement_leave: '',
    },
  ];

  addItem() {
    this.leave_standard = this.addCompanyForm.get(
      'leave_standard'
    ) as FormArray;
    this.leave_standard.push(this.createItem());
  }
  cancelItem(i: any) {
    if (this.leave_standard) {
      this.leave_standard.removeAt(i);
    }
  }

  //////////////////////////////////

  ngOnDestroy() {
    // unsubscribe all subscription
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  toBack(): void {
    this.router.navigate(['company']);
  }

  onSubmit() {
    // 회사 추가
    this.addCompany();
  }

  // 회사 추가
  addCompany() {
    const companyData = {
      company_name: this.addCompanyForm.value.company_name,
      leave_standard: this.addCompanyForm.value.leave_standard,
      rollover: this.addCompanyForm.value.isRollover,
      rollover_max_month: this.addCompanyForm.value.rollover_max_month,
      rollover_max_day: this.addCompanyForm.value.rollover_max_day,
      isReplacementDay: this.addCompanyForm.value.isReplacementDay,
      isMinusAnnualLeave: this.addCompanyForm.value.isMinusAnnualLeave,
      rd_validity_term: this.addCompanyForm.value.rd_validity_term,
      annual_policy: this.addCompanyForm.value.annual_policy,
    };
    //data : this.addCompanyForm.value
    console.log(companyData);

    this.companyService.addCompany(companyData).subscribe((data: any) => {
      if (data.message == 'Success add company') {
        this.router.navigate(['company']);
      }
    });
  }

  errorAlert(err: any) {
    switch (err) {
      case 'Duplicate requestLeave':
        // this.dialogService.openDialogNegative('Duplicate requestLeave.');
        break;
      case 'DB Error':
        // this.dialogService.openDialogNegative(
        //   'An error has occurred while requesting'
        // );
        break;
    }
  }
}
