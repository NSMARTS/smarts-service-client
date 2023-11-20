import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/company/company.service';
import { DialogService } from 'src/app/services/dialog/dialog.service';

@Component({
  selector: 'app-company-add',
  templateUrl: './company-add.component.html',
  styleUrls: ['./company-add.component.scss'],
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
})
export class CompanyAddComponent {
  addCompanyForm: FormGroup;
  leaveStandards!: FormArray;

  constructor(
    private router: Router,
    private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private companyService: CompanyService
  ) {
    this.addCompanyForm = this.formBuilder.group({
      companyName: ['', [Validators.required]],
      leaveStandards: this.formBuilder.array([]),
      isRollover: [false],
      rolloverMaxMonth: [0, [Validators.min(0)]],
      rolloverMaxLeaveDays: [0, [Validators.min(0)]],
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

    this.leaveStandards = this.addCompanyForm.get(
      'leaveStandards'
    ) as FormArray;
    this.addItem();
  }

  contractDatePickChange(dateValue: any) {
    this.addCompanyForm.get('contractDate')?.setValue(dateValue);
  }

  payDatePickChange(dateValue: any) {
    this.addCompanyForm.get('payDate')?.setValue(dateValue);
  }

  getLeaveStandardsControls() {
    return (this.addCompanyForm.get('leaveStandards') as FormArray).controls;
  }

  createLeaveStandard(): FormGroup {
    return this.formBuilder.group({
      year: 0,
      annualLeave: [0, [Validators.min(0)]],
      sickLeave: [0, [Validators.min(0)]],
    });
  }

  //Leave Standard에 + 버튼 클릭
  addItem() {
    const newLeaveStandard = this.createLeaveStandard();
    this.leaveStandards.push(newLeaveStandard);
    this.updateYears();
  }

  //Leave Standard에 - 버튼 클릭
  cancelItem(index: number) {
    if (this.leaveStandards.length > index) {
      this.leaveStandards.removeAt(index);
      this.updateYears();
    }
  }
  updateYears() {
    this.leaveStandards.controls.forEach((group, index) => {
      group.get('year')?.setValue(index + 1);
    });
  }

  //Cancel 버튼 클릭
  toBack(): void {
    this.router.navigate(['company']);
  }

  //회사 등록
  addCompany() {
    if (this.addCompanyForm.valid) {
      const isRollover = this.addCompanyForm.get('isRollover')?.value;
      const isReplacementDay =
        this.addCompanyForm.get('isReplacementDay')?.value;

      const leaveStandards = this.addCompanyForm.get('leaveStandards')?.value;
      const leaveStandardsLength = leaveStandards.length;
      const lastLeaveStandard = leaveStandards[leaveStandards.length - 1];
      const lastAnnualLeave = lastLeaveStandard.annualLeave;
      const lastSickLeave = lastLeaveStandard.sickLeave;

      const companyData = {
        ...this.addCompanyForm.value,
        // 연차날짜를 입력한 후 연차모드를 false로 바꿨을 시 0으로 초기화
        rolloverMaxMonth: isRollover
          ? this.addCompanyForm.get('rolloverMaxMonth')?.value
          : 0,
        rolloverMaxLeaveDays: isRollover
          ? this.addCompanyForm.get('rolloverMaxLeaveDays')?.value
          : 0,
        rdValidityTerm: isReplacementDay
          ? this.addCompanyForm.get('rdValidityTerm')?.value
          : 0,
        leaveStandards: leaveStandards.concat(
          Array(50)
            .fill(null)
            .map((_, index) => ({
              year: leaveStandardsLength + index + 1,
              annualLeave: lastAnnualLeave,
              sickLeave: lastSickLeave,
            }))
        ),
        leaveStandardsLength: leaveStandardsLength,
      };
      console.log(companyData);
      this.companyService.addCompany(companyData).subscribe({
        next: (res) => {
          this.router.navigate(['company']);
          this.dialogService.openDialogPositive(
            'Successfully, the company has been add.'
          );
        },
        error: (err) => {
          console.error(err);
          if (err.status === 409) {
            this.dialogService.openDialogNegative(
              'Company name is duplicated.'
            );
          } else {
            this.dialogService.openDialogNegative(
              'An error occurred while adding company.'
            );
          }
        },
      });
    }
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
