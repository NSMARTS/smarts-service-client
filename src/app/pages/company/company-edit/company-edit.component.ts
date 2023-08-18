import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/leave/company/company.service';
import { DataService } from 'src/app/stores/data/data.service';
// import { DialogService } from 'src/@dw/dialog/dialog.service';

@Component({
  selector: 'app-company-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule],
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss'],
})
export class CompanyEditComponent implements OnInit {
  ///////////////////////////////////////
  editCompanyId: any;
  companyData: any;
  ///////////////////////////////////////

  days: any;
  start_date_sec: any;
  end_date_sec: any;
  millisecondsPerDay: any;
  diff: any;
  weeks: any;
  leaveDays: any;

  leave_standard: FormArray | undefined;
  editCompanyForm = new FormGroup<any>({
    company_name: new FormControl(''),
    // annual_leave: new FormControl(''),
    // sick_leave: new FormControl(''),
    // replacement_leave: new FormControl(''),
    leave_standard: this.formBuilder.array([this.createItem()]),
    isRollover: new FormControl(''),
    rollover_max_month: new FormControl(0),
    rollover_max_day: new FormControl(0),
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
    private companyService: CompanyService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.minDate = '';

    this.dataService.userProfile.subscribe((res: any) => {
      // console.log('request-leave dataService data >>>', res);
      this.myInfo = res;
    });

    /////////////////////////////////////////////////////////////////////////////
    this.editCompanyId = this.route.snapshot.params['id'];
    this.companyService
      .getCompanyInfo(this.editCompanyId)
      .subscribe((data: any) => {
        // 불러온 회사 정보
        this.companyData = data.getCompany;
        console.log(data);
        this.editCompanyForm.patchValue(data.getCompany);
        this.leave_standard = this.editCompanyForm.get(
          'leave_standard'
        ) as FormArray;
        this.leave_standard.clear(); // 기존 컨트롤 제거

        // 새로운 컨트롤 추가
        for (let i = 0; i < this.companyData.leave_standard.length; i++) {
          this.leave_standard.push(this.createItem());
        }
        //   console.log(this.companyData?.isMinusAnnualLeave);
      });
    /////////////////////////////////////////////////////////////////////////////
  }

  //////////////////////////////////
  createItem(): FormGroup {
    return this.formBuilder.group({
      year: 0,
      annual_leave: 0,
      sick_leave: 0,
      replacement_leave: 0,
      rollover: 0,
    });
  }

  getControls() {
    return (this.editCompanyForm.get('leave_standard') as FormArray).controls;
  }

  addItem() {
    this.leave_standard = this.editCompanyForm.get(
      'leave_standard'
    ) as FormArray;
    this.leave_standard.push(this.createItem());

    console.log(this.leave_standard);
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
    const companyData = {
      _id: this.editCompanyId,
      company_name: this.editCompanyForm.value.company_name,
      leave_standard: this.editCompanyForm.value.leave_standard,
      rollover: this.editCompanyForm.value.isRollover,
      rollover_max_month: this.editCompanyForm.value.rollover_max_month,
      rollover_max_day: this.editCompanyForm.value.rollover_max_day,
      isReplacementDay: this.editCompanyForm.value.isReplacementDay,
      isMinusAnnualLeave: this.editCompanyForm.value.isMinusAnnualLeave,
      rd_validity_term: this.editCompanyForm.value.rd_validity_term,
      annual_policy: this.editCompanyForm.value.annual_policy,
    };

    console.log(companyData);
    this.companyService.editCompany(companyData).subscribe((data: any) => {
      console.log(data);
      if (data.message == 'Success edit company') {
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
