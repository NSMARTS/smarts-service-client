import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { CountryService } from 'src/app/services/country.service';
import { Country } from 'src/app/interfaces/country.interface';
import { EmployeeService } from 'src/app/services/employee.service';

@Component({
    selector: 'app-employee-add',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialsModule],
    templateUrl: './employee-add.component.html',
    styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent implements OnInit {

    countryService = inject(CountryService)
    employeeService = inject(EmployeeService)
    router = inject(Router);
    employeeForm: FormGroup = new FormGroup({
        email: new FormControl(''),
        username: new FormControl(''),
        isManager: new FormControl(false),
        contractStartDate: new FormControl(''),
        contractEndDate: new FormControl(''),
        selectedCountryId: new FormControl(''),
    });
    countries: Country[] = []

    ngOnInit() {
        this.countryService.getCountries().subscribe({
            next: (res: any) => {
                this.countries = res
            },
            error: (e) => console.error(e)
        })
    }

    createEmployee() {
        console.log(this.employeeForm.value)
        this.employeeService.createEmployee(this.employeeForm.value).subscribe({
            next: (res: any) => {
                this.countries = res
                this.router.navigate(['employee'])
            },
            error: (e) => console.error(e)
        })

    }
}
