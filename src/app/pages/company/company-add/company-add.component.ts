import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';



import { Subject } from 'rxjs';

import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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

    leave_standard!: FormArray; // 연차 정책 form

    leave_standard_year: number = 0; // 근속년수


    constructor(
        private router: Router,
        // private dialogService: DialogService,
        private formBuilder: FormBuilder,
        private companyService: CompanyService
    ) {
        this.addCompanyForm = this.formBuilder.group({
            company_name: [''],
            leave_standard: this.formBuilder.array([this.createItem(this.leave_standard_year)]),
            isRollover: [false],
            rollover_max_month: [0],
            rollover_max_day: [0],
            country_code: [''],
            isReplacementDay: [false],
            rd_validity_term: [0],
            isMinusAnnualLeave: [false],
            annual_policy: ['byContract'],
        })
    }

    getControls() {
        return (this.addCompanyForm.get('leave_standard') as FormArray).controls;
    }

    //////////////////////////////////
    createItem(i: number): FormGroup {
        return this.formBuilder.group({
            year: i + 1, // 근속년수
            annual_leave: '',
            sick_leave: '',
        });
    }

    addItem() {
        this.leave_standard = this.addCompanyForm.get(
            'leave_standard'
        ) as FormArray;
        this.leave_standard.push(this.createItem(this.leave_standard_year));
    }

    cancelItem(i: any) {
        if (this.leave_standard) {
            this.leave_standard.removeAt(i);
        }
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
        const isRollover = this.addCompanyForm.get('isRollover')?.value;
        const isReplacementDay = this.addCompanyForm.get('isReplacementDay')?.value;

        const companyData = {
            ...this.addCompanyForm.value,
            rollover_max_month: isRollover ? this.addCompanyForm.get('rollover_max_month')?.value : 0,
            rollover_max_day: isRollover ? this.addCompanyForm.get('rollover_max_day')?.value : 0,
            rd_validity_term: isReplacementDay ? this.addCompanyForm.get('rd_validity_term')?.value : 0,
        };
        //data : this.addCompanyForm.value

        this.companyService.addCompany(companyData).subscribe({
            next: (res) => {
                if (res) {
                    this.router.navigate(['company']);
                }
            },
            error: (err) => console.error(err)
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
