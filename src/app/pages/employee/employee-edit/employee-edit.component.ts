import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { EmployeeService } from 'src/app/services/employee.service';
import { CommonService } from 'src/app/services/common.service';

import { Country, Employee } from 'src/app/interfaces/employee.interface';
import { CountryService } from 'src/app/services/country.service';

@Component({
    selector: 'app-employee-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialsModule],
    templateUrl: './employee-edit.component.html',
    styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent {
    employeeId: string = '';
    getEmployeeInfo: any;
    countryList: Country[] = [];
    companyName: string = '';
    // FormGroup
    editEmployeeForm: FormGroup = this.fb.group({
        username: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea 
        isManager: new FormControl(false, [Validators.required]),
        empStartDate: new FormControl('', [Validators.required]),
        empEndDate: new FormControl(''),
        department: new FormControl(''),
        position: new FormControl(''),
        annualLeave: new FormControl(''),
        sickLeave: new FormControl(''),
        replacementDay: new FormControl(''),
    });


    employees = this.employeeService.employees

    employee!: Employee;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private employeeService: EmployeeService,
        private countryService: CountryService,

        private commonService: CommonService,


    ) {
        this.employeeId = this.route.snapshot.params['id'];
        this.companyName = this.route.snapshot.params['companyName'];



    }

    ngOnInit(): void {
        // 상태저장 중인 employees 호출
        if (this.employees().length > 0) {
            const employee = this.employees()?.filter((employee) => employee._id === this.employeeId)
            if (!employee) return
            this.editEmployeeForm.patchValue(this.employee);
            this.getCountryList()
        }
        // 상태저장 중인 employees가 없다면 http 호출
        // getCountryList 안에 getEmployee()가 있다.
        this.getCountryList()
    }

    getCountryList() {
        this.countryService.getCountryList().subscribe({
            next: (res) => {
                this.countryList = res.data
                this.getEmployee()
            },
            error: (err) => console.error(err)
        })
    }

    getEmployee() {
        this.employeeService.getEmployee(this.employeeId).subscribe({
            next: (res) => {
                this.employee = res.data
                this.editEmployeeForm.patchValue(this.employee);
            },
            error: (err) => console.error(err)
        })
    }

    backManagerList() {
        this.router.navigate(['leave/employee-mngmt/manager-list']);
    }

    updateProfileInfo() {

    }

    updateLeaveInfo() {

    }
}
