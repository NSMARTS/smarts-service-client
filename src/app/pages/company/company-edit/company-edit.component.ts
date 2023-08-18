import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
    editCompanyId: any;
    ///////////////////////////////////////

    days: any;
    start_date_sec: any;
    end_date_sec: any;
    millisecondsPerDay: any;
    diff: any;
    weeks: any;
    leaveDays: any;

    leave_standard_year: number = 0; // 근속년수

    leave_standard!: FormArray;
    editCompanyForm: FormGroup;


    constructor(
        private fb: FormBuilder,
        private dataService: DataService,
        private router: Router,
        // private dialogService: DialogService,
        private formBuilder: FormBuilder,
        private companyService: CompanyService,
        private route: ActivatedRoute
    ) {
        this.editCompanyForm = this.formBuilder.group({
            company_name: [''],
            leave_standard: this.formBuilder.array([this.createItem(this.leave_standard_year)]),
            isRollover: [false],
            rollover_max_month: [0],
            rollover_max_day: [0],
            isReplacementDay: [''],
            isMinusAnnualLeave: [''],
            rd_validity_term: [''],
            annual_policy: ['byContract'],
        });
    }

    ngOnInit(): void {
        this.editCompanyId = this.route.snapshot.params['id'];
        this.companyService
            .getCompanyInfo(this.editCompanyId)
            .subscribe({
                next: (res) => {
                    const companyData = res.data
                    this.editCompanyForm.patchValue(companyData);
                    this.leave_standard = this.editCompanyForm.get('leave_standard') as FormArray;
                    this.leave_standard.clear(); // 기존 컨트롤 제거
                    const leave_standard_year = companyData.leave_standard
                    // 새로운 컨트롤 추가
                    for (let i = 0; i < leave_standard_year.length; i++) {
                        this.leave_standard_year = i; // 근속년수
                        this.leave_standard.push(this.createItem(i));
                    }
                },
                error: (err) => console.error(err)
            });
        /////////////////////////////////////////////////////////////////////////////
    }

    //////////////////////////////////
    createItem(i: number): FormGroup {
        return this.formBuilder.group({
            year: i + 1,
            annual_leave: 0,
            sick_leave: 0,
        });
    }

    getControls() {
        return (this.editCompanyForm.get('leave_standard') as FormArray).controls;
    }

    addItem() {
        this.leave_standard = this.editCompanyForm.get(
            'leave_standard'
        ) as FormArray;
        this.leave_standard.push(this.createItem(this.leave_standard_year));
    }

    cancelItem(i: any) {
        if (this.leave_standard) {
            this.leave_standard.removeAt(i);
        }
    }

    //////////////////////////////////

    toBack(): void {
        this.router.navigate(['company']);
    }

    onSubmit() {
        // 회사 추가
        const companyData = {
            ...this.editCompanyForm.value
        };

        this.companyService.editCompany(this.editCompanyId, companyData).subscribe({
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
