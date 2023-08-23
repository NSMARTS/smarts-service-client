import { EmployeeService } from 'src/app/services/employee.service';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialsModule } from 'src/app/materials/materials.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CountryService } from 'src/app/services/country.service';
import { Country } from 'src/app/interfaces/employee.interface';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, MaterialsModule, RouterModule, ReactiveFormsModule],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss'],
})
export class EmployeeAddComponent {
  addEmployeeForm: FormGroup;
  companyId!: string; //params id
  nationList: Country[] = [];

  constructor(
    private router: Router,
    // private dialogService: DialogService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private countryService: CountryService,
    private commonService: CommonService
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.addEmployeeForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea
      isManager: new FormControl(false, [Validators.required]),
      empStartDate: new FormControl('', [Validators.required]),
      empEndDate: new FormControl(''),
      department: new FormControl(''),
      posiotion: new FormControl(''),
    });

    this.countryService.getCountryList().subscribe({
      next: (res) => {
        console.log(res.data);
        this.nationList = res.data;
      },
      error: (err) => console.error(err),
    });
  }

  onSubmit() {
    const postData = {
      ...this.addEmployeeForm.value,
      companyId: this.companyId,
      countryId: this.addEmployeeForm.value['country'],
      empStartDate: this.commonService.dateFormatting(
        this.addEmployeeForm.value['empEndDate']
      ),
      empEndDate: this.addEmployeeForm.value['empEndDate']
        ? this.commonService.dateFormatting(this.addEmployeeForm.value['empEndDate'])
        : null,
    };
    console.log(this.addEmployeeForm.value);
    console.log(postData);
    console.log(this.route.snapshot.params['id']);
    this.employeeService.addEmployee(postData).subscribe({
      next: (res) => {
        this.router.navigate([`/employee/${this.companyId}`]);
      },
      error: (e) => console.error(e),
    });
  }

  toBack() {
    this.router.navigate([`/employee/${this.companyId}`]);
  }
}
