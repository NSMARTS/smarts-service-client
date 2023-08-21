import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Subject } from 'rxjs';

import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DataService } from 'src/app/stores/data/data.service';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-company-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './company-add.component.html',
  styleUrls: ['./company-add.component.scss'],
})
export class CompanyAddComponent {
  addCompanyForm: FormGroup;

  leaveStandard!: FormArray; // 연차 정책 form

  leaveStandardYear: number = 0; // 근속년수
  year: number = 0;

  constructor(
    private router: Router,
    // private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService
  ) {
    this.addCompanyForm = this.formBuilder.group({
      companyName: [''],
      leaveStandard: this.formBuilder.array([
        this.createItem(this.leaveStandardYear),
      ]),
      isRollover: [false],
      rolloverMaxMonth: [0, [Validators.min(0)]],
      rolloverMaxDay: [0, [Validators.min(0)]],
      countryCode: [''],
      isReplacementDay: [false],
      rdValidityTerm: [0, [Validators.min(0)]],
      isMinusAnnualLeave: [false],
      annualPolicy: ['byContract'],
    });
  }

  getControls() {
    return (this.addCompanyForm.get('leaveStandard') as FormArray).controls;
  }

  //////////////////////////////////
  createItem(i: number): FormGroup {
    this.year++;
    return this.formBuilder.group({
      year: this.year, // 근속년수
      annualLeave: [0, [Validators.min(0)]],
      sickLeave: [0, [Validators.min(0)]],
    });
  }

  addItem() {
    this.leaveStandard = this.addCompanyForm.get('leaveStandard') as FormArray;
    this.leaveStandard.push(this.createItem(this.leaveStandardYear));
  }

  cancelItem(i: any) {
    if (this.leaveStandard) {
      this.leaveStandard.removeAt(i);
    }
  }

  toBack(): void {
    this.router.navigate(['company']);
  }

  onSubmit() {
    // 회사 추가
    this.addCompany();
  }

  isButtonDisabled(): any {
    const rolloverMaxMonthError = this.addCompanyForm
      .get('rolloverMaxMonth')
      ?.hasError('min');
    const rolloverMaxDayError = this.addCompanyForm
      .get('rolloverMaxDay')
      ?.hasError('min');
    const rdValidityTermError = this.addCompanyForm
      .get('rdValidityTerm')
      ?.hasError('min');
    const leaveStandardArray = this.addCompanyForm.get(
      'leaveStandard'
    ) as FormArray;
    const firstLeaveStandardGroup = leaveStandardArray.at(0) as FormGroup;
    const annualLeaveError = firstLeaveStandardGroup
      .get('annualLeave')
      ?.hasError('min');
    const sickLeaveError = firstLeaveStandardGroup
      .get('sickLeave')
      ?.hasError('min');

    // 어떤 폼 컨트롤이라도 'min' 오류가 있는 경우 버튼을 비활성화
    return (
      rolloverMaxMonthError ||
      rolloverMaxDayError ||
      rdValidityTermError ||
      annualLeaveError ||
      sickLeaveError
    );
  }

  // 회사 추가
  addCompany() {
    const isRollover = this.addCompanyForm.get('isRollover')?.value;
    const isReplacementDay = this.addCompanyForm.get('isReplacementDay')?.value;

    const companyData = {
      ...this.addCompanyForm.value,
      // 연차날짜를 입력한 후 연차모드를 false로 바꿨을 시 0으로 초기화
      rolloverMaxMonth: isRollover
        ? this.addCompanyForm.get('rolloverMaxMonth')?.value
        : 0,
      rolloverMaxDay: isRollover
        ? this.addCompanyForm.get('rolloverMaxDay')?.value
        : 0,
      rdValidityTerm: isReplacementDay
        ? this.addCompanyForm.get('rdValidityTerm')?.value
        : 0,
    };
    //data : this.addCompanyForm.value

    this.companyService.addCompany(companyData).subscribe({
      next: (res) => {
        if (res) {
          this.router.navigate(['company']);
        }
      },
      error: (err) => console.error(err),
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
