import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogService } from 'src/app/services/dialog.service';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/company.service';

@Component({
  selector: 'app-company-edit',
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
})
export class CompanyEditComponent implements OnInit {
  companyId!: string; //params id
  leaveStandards!: FormArray;
  editCompanyForm: FormGroup;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private route: ActivatedRoute
  ) {
    this.editCompanyForm = this.formBuilder.group({
      companyName: ['', [Validators.required]],
      leaveStandards: this.formBuilder.array([]),
      isRollover: [false],
      rolloverMaxMonth: [0, [Validators.min(0)]],
      rolloverMaxDay: [0, [Validators.min(0)]],
      countryCode: [''],
      isReplacementDay: [false],
      rdValidityTerm: [0, [Validators.min(0)]],
      isAdvanceLeave: [false],
      isPending: [false],
      annualPolicy: ['byContract'],
      contractDate: [''],
      payDate: [''],
      paymentRequired: [false],
    });
    this.leaveStandards = this.editCompanyForm.get(
      'leaveStandards'
    ) as FormArray;
    this.addItem();
  }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.companyService.getCompanyInfo(this.companyId).subscribe({
      next: (res) => {
        const companyData = res.data;
        this.editCompanyForm.patchValue(companyData);
        this.leaveStandards = this.editCompanyForm.get(
          'leaveStandards'
        ) as FormArray;
        // 기존 컨트롤 제거
        this.leaveStandards.clear();
        // 새로운 컨트롤 추가
        for (let i = 0; i < companyData.leaveStandards.length; i++) {
          this.leaveStandards.push(
            this.getLeaveStandard(companyData.leaveStandards[i])
          );
        }
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('Company not found');
        } else {
          console.error('An error occurred while fetching company info');
        }
      },
    });
  }

  contractDatePickChange(dateValue: any) {
    this.editCompanyForm.get('contractDate')?.setValue(dateValue);
  }

  payDatePickChange(dateValue: any) {
    this.editCompanyForm.get('payDate')?.setValue(dateValue);
  }

  /////////////////////////////////////////////////////////////////////////////
  /**
   * leaveStandards 연차 별 휴가 ex) year, annualLeave, sickLeave
   * + 버튼 누를 시 item을 추가 하고 싶으면
   * 먼저 formArray를 선언하고 FormArray.cotrols 객체를 가져온다.
   * @returns
   */
  getLeaveStandardsControls() {
    return (this.editCompanyForm.get('leaveStandards') as FormArray).controls;
  }

  /**
   * 기존 연차정책을 가져와, formgroup객체 형식으로 만든 후 FormArray에 담는다.
   * @returns
   */
  getLeaveStandard(data: any): FormGroup {
    return this.formBuilder.group({
      year: data.year,
      annualLeave: [data.annualLeave, [Validators.min(0)]],
      sickLeave: [data.sickLeave, [Validators.min(0)]],
    });
  }

  /**
   * + 버튼 누를 시 item을 추가
   * @returns
   */
  createLeaveStandard(): FormGroup {
    return this.formBuilder.group({
      year: 0,
      annualLeave: [0, [Validators.min(0)]],
      sickLeave: [0, [Validators.min(0)]],
    });
  }

  /**
   * + 버튼 클릭 시
   * 기존에 가져온 연차정책에
   * {year:leaveStandards.lenhth, annualLeave: 0 , sickLeave: 0}
   * leaveStandards : FormArray에 담는다.
   */
  addItem() {
    const newLeaveStandard = this.createLeaveStandard();
    this.leaveStandards.push(newLeaveStandard);
    this.updateYears();
  }

  cancelItem(i: any) {
    if (this.leaveStandards) {
      this.leaveStandards.removeAt(i);
      this.updateYears();
    }
  }
  /**
   * item에 year를 추가하거나 제거하면
   * leaveStandards에 기존 배열의 year들도 수정
   */
  updateYears() {
    this.leaveStandards.controls.forEach((group, index) => {
      group.get('year')?.setValue(index + 1);
    });
  }
  //////////////////////////////////

  //Cancel 버튼 클릭
  toBack(): void {
    this.router.navigate(['company']);
  }

  //Edit 버튼 클릭
  onSubmit() {
    const companyData = {
      ...this.editCompanyForm.value,
    };

    this.companyService.editCompany(this.companyId, companyData).subscribe({
      next: () => {
        console.log(companyData);
        this.router.navigate(['company']);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          this.dialogService.openDialogNegative('Company not found');
        } else {
          this.dialogService.openDialogNegative(
            'An error occurred while updating company'
          );
        }
      },
    });
  }

  //유효성 검사
  isButtonDisabled(): any {
    const companyNameError = this.editCompanyForm
      .get('companyName')
      ?.hasError('required');
    const rolloverMaxMonthError = this.editCompanyForm
      .get('rolloverMaxMonth')
      ?.hasError('min');
    const rolloverMaxDayError = this.editCompanyForm
      .get('rolloverMaxDay')
      ?.hasError('min');
    const rdValidityTermError = this.editCompanyForm
      .get('rdValidityTerm')
      ?.hasError('min');

    const leaveStandardsArray = this.editCompanyForm.get(
      'leaveStandards'
    ) as FormArray;
    let hasErrors = false;
    leaveStandardsArray.controls.forEach((group) => {
      const annualLeaveError = group.get('annualLeave')?.hasError('min');
      const sickLeaveError = group.get('sickLeave')?.hasError('min');
      if (annualLeaveError || sickLeaveError) {
        hasErrors = true;
      }
    });

    return (
      companyNameError ||
      rolloverMaxMonthError ||
      rolloverMaxDayError ||
      rdValidityTermError ||
      hasErrors
    );
  }

  //input type="number" 한글 안써지도록
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    if (inputElement.classList.contains('numeric-input')) {
      const numericValue = inputValue.replace(/[^-\d]/g, '');
      inputElement.value = numericValue;
    }
  }
  errorAlert(err: any) {
    switch (err) {
      case 'Duplicate requestLeave':
        this.dialogService.openDialogNegative('Duplicate requestLeave.');
        break;
      case 'DB Error':
        this.dialogService.openDialogNegative(
          'An error has occurred while requesting'
        );
        break;
    }
  }
}
