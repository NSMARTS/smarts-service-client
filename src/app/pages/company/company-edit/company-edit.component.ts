import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { Company, InitialCompany } from 'src/app/interfaces/company.interface';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CompanyService } from 'src/app/services/company.service';
import { DataService } from 'src/app/stores/data/data.service';
// import { DialogService } from 'src/@dw/dialog/dialog.service';

@Component({
  selector: 'app-company-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss'],
})
export class CompanyEditComponent implements OnInit {
  ///////////////////////////////////////
  editCompanyId!: string; //params id
  ///////////////////////////////////////
  leaveStandards!: FormArray;
  editCompanyForm: FormGroup;

  constructor(
    private router: Router,
    // private dialogService: DialogService,
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
      isMinusAnnualLeave: [false],
      annualPolicy: ['byContract'],
    });
    this.leaveStandards = this.editCompanyForm.get(
      'leaveStandards'
    ) as FormArray;
    this.addItem();
  }

  ngOnInit(): void {
    this.editCompanyId = this.route.snapshot.params['id'];
    this.companyService.getCompanyInfo(this.editCompanyId).subscribe({
      next: (res) => {
        const companyData = res.data;
        this.editCompanyForm.patchValue(companyData);
        this.leaveStandards = this.editCompanyForm.get(
          'leaveStandards'
        ) as FormArray;
        this.leaveStandards.clear(); // 기존 컨트롤 제거
        // 새로운 컨트롤 추가
        for (let i = 0; i < companyData.leaveStandards.length; i++) {
          this.leaveStandards.push(
            this.getLeaveStandard(companyData.leaveStandards[i])
          );
        }
      },
      error: (err) => console.error(err),
    });
    /////////////////////////////////////////////////////////////////////////////
  }

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
      annualLeave: data.annualLeave,
      sickLeave: data.sickLeave,
    });
  }

  /**
   * + 버튼 누를 시 item을 추가
   * @returns
   */
  createLeaveStandard(i: number): FormGroup {
    return this.formBuilder.group({
      year: i + 1,
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
    const newYear = this.leaveStandards.length + 1;
    const newLeaveStandard = this.createLeaveStandard(newYear);
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

  toBack(): void {
    this.router.navigate(['company']);
  }

  onSubmit() {
    // 회사 추가
    const companyData = {
      ...this.editCompanyForm.value,
    };

    this.companyService.editCompany(this.editCompanyId, companyData).subscribe({
      next: (res) => {
        if (res) {
          this.router.navigate(['company']);
        }
      },
      error: (err) => console.error(err),
    });
  }

  //input type="number" 음수 안되는 유효성 검사
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
    const firstLeaveStandardGroup = leaveStandardsArray.at(0) as FormGroup;
    const annualLeaveError = firstLeaveStandardGroup
      .get('annualLeave')
      ?.hasError('min');
    const sickLeaveError = firstLeaveStandardGroup
      .get('sickLeave')
      ?.hasError('min');

    // 어떤 폼 컨트롤이라도 'min' 오류가 있는 경우 버튼을 비활성화
    return (
      companyNameError ||
      rolloverMaxMonthError ||
      rolloverMaxDayError ||
      rdValidityTermError ||
      annualLeaveError ||
      sickLeaveError
    );
  }

  //input type="number" 한글 안써지도록
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    if (inputElement.classList.contains('numeric-input')) {
      // 입력값에서 숫자 이외의 문자를 제거
      const numericValue = inputValue.replace(/[^-\d]/g, '');

      // 입력 필드에 정제된 값 설정
      inputElement.value = numericValue;
    }
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
