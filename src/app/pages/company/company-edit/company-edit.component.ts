import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
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
    editCompanyId: any;
    ///////////////////////////////////////

    days: any;
    start_date_sec: any;
    end_date_sec: any;
    millisecondsPerDay: any;
    diff: any;
    weeks: any;
    leaveDays: any;

    leaveStandardsYear: number = 0; // 근속년수

    leaveStandards!: FormArray;
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
            companyName: [''],
            leaveStandards: this.formBuilder.array([
                this.createItem(this.leaveStandardsYear),
            ]),
            isRollover: [false],
            rolloverMaxMonth: [0],
            rolloverMaxDay: [0],
            isReplacementDay: [''],
            isMinusAnnualLeave: [''],
            rdValidityTerm: [''],
            annualPolicy: ['byContract'],
        });
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
                console.log(companyData.leaveStandards);
                for (let i = 0; i < this.leaveStandards.length; i++) {
                    this.leaveStandardsYear = i + 1; // 근속년수
                    this.leaveStandards.push(this.createItem(this.leaveStandardsYear));
                }
            },
            error: (err) => console.error(err),
        });
        /////////////////////////////////////////////////////////////////////////////
    }

    //////////////////////////////////
    createItem(i: number): FormGroup {
        return this.formBuilder.group({
            year: i,
            annualLeave: 0,
            sickLeave: 0,
        });
    }

    getLeaveStandards() {
        return (this.editCompanyForm.get('leaveStandards') as FormArray).controls;
    }

    addItem() {
        this.leaveStandards = this.editCompanyForm.get('leaveStandards') as FormArray;
        this.leaveStandards.push(this.createItem(this.leaveStandardsYear));
    }

    cancelItem(i: any) {
        if (this.leaveStandards) {
            this.leaveStandards.removeAt(i);
        }
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
