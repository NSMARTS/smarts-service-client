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
    leaveStandards!: FormArray; // 연차 정책 form

    constructor(
        private router: Router,
        // private dialogService: DialogService,
        private formBuilder: FormBuilder,
        private companyService: CompanyService
    ) {
        this.addCompanyForm = this.formBuilder.group({
            companyName: ['', [Validators.required]],
            leaveStandards: this.formBuilder.array([]),
            isRollover: [false],
            rolloverMaxMonth: [0, [Validators.min(0)]],
            rolloverMaxDay: [0, [Validators.min(0)]],
            countryCode: [''],
            isReplacementDay: [false],
            rdValidityTerm: [0, [Validators.min(0)]],
            isAdvanceLeave: [false],
            annualPolicy: ['byContract'],
        });

        this.leaveStandards = this.addCompanyForm.get(
            'leaveStandards'
        ) as FormArray;
        this.addItem();
    }

    getLeaveStandardsControls() {
        return (this.addCompanyForm.get('leaveStandards') as FormArray).controls;
    }

    //////////////////////////////////
    createLeaveStandard(year: number): FormGroup {
        return this.formBuilder.group({
            year,
            annualLeave: [0, [Validators.min(0)]],
            sickLeave: [0, [Validators.min(0)]],
        });
    }

    addItem() {
        const newYear = this.leaveStandards.length + 1;
        const newLeaveStandard = this.createLeaveStandard(newYear);
        this.leaveStandards.push(newLeaveStandard);
        this.updateYears();
    }

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

    toBack(): void {
        this.router.navigate(['company']);
    }

    onSubmit() {
        this.addCompany();
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
        console.log(companyData);

        this.companyService.addCompany(companyData).subscribe({
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
        const companyNameError = this.addCompanyForm
            .get('companyName')
            ?.hasError('required');
        const rolloverMaxMonthError = this.addCompanyForm
            .get('rolloverMaxMonth')
            ?.hasError('min');
        const rolloverMaxDayError = this.addCompanyForm
            .get('rolloverMaxDay')
            ?.hasError('min');
        const rdValidityTermError = this.addCompanyForm
            .get('rdValidityTerm')
            ?.hasError('min');
        const leaveStandardsArray = this.addCompanyForm.get(
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
