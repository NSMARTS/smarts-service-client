import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { Subject } from 'rxjs';

import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
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

    leaveStandards!: FormArray; // 연차 정책 form

    leaveStandardsYear: number = 0; // 근속년수

    constructor(
        private router: Router,
        // private dialogService: DialogService,
        private formBuilder: FormBuilder,
        private companyService: CompanyService
    ) {
        this.addCompanyForm = this.formBuilder.group({
            companyName: [''],
            leaveStandards: this.formBuilder.array([]),
            isRollover: [false],
            rolloverMaxMonth: [0],
            rolloverMaxDay: [0],
            countryCode: [''],
            isReplacementDay: [false],
            rdValidityTerm: [0],
            isMinusAnnualLeave: [false],
            annualPolicy: ['byContract'],
        });

        this.leaveStandards = this.addCompanyForm.get('leaveStandards') as FormArray;
        this.addItem();
    }

    getLeaveStandardsControls() {
        return this.leaveStandards.controls;
    }


    //////////////////////////////////
    createLeaveStandard(year: number): FormGroup {
        return this.formBuilder.group({
            year,
            annualLeave: 0,
            sickLeave: 0,
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
        console.log(companyData)

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
