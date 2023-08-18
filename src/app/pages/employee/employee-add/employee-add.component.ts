import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';

@Component({
    selector: 'app-employee-add',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialsModule],
    templateUrl: './employee-add.component.html',
    styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent {


    employeeForm: FormGroup = new FormGroup({
        email: new FormControl(''),
        username: new FormControl(''),
        isManager: new FormControl(false),
        contractStartDate: new FormControl(''),
        contractStartEnd: new FormControl(''),

    });
}
