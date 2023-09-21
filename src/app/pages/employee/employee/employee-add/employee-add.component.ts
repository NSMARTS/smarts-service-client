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
import { DialogService } from 'src/app/services/dialog.service';

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
    private commonService: CommonService,
    private dialogService: DialogService
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.addEmployeeForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl(''),
      country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea
      empStartDate: new FormControl('', [Validators.required]),
      empEndDate: new FormControl(''),
      department: new FormControl(''),
      posiotion: new FormControl(''),
    });

    this.countryService.getCountryList().subscribe({
      next: (res: any) => {
        this.nationList = res.data;
      },
      error: (err: any) => console.error(err),
    });
  }

  onSubmit() {
    if (this.hasErrors()) {
      //유효성 검사 실패 시 빨갛게 나옴
    } else {
      // 유효성 검사 통과 시
      this.addEmployee();
    }
  }

  addEmployee() {
    const postData = {
      ...this.addEmployeeForm.value,
      company: this.companyId,
      country: this.addEmployeeForm.value['country'],
      empStartDate: this.commonService.dateFormatting(
        this.addEmployeeForm.value['empStartDate']
      ),
      empEndDate: this.addEmployeeForm.value['empEndDate']
        ? this.commonService.dateFormatting(
          this.addEmployeeForm.value['empEndDate']
        )
        : null,
    };

    this.employeeService.addEmployee(postData).subscribe({
      next: (res) => {
        this.router.navigate([`/company/${this.companyId}/employee`]);
        this.dialogService.openDialogPositive(
          'Successfully, the employee has been add.'
        );
      },
      error: (err) => {
        console.error(err);
        if (err.status === 409) {
          this.dialogService.openDialogNegative(
            'Employee email is duplicated.'
          );
        } else {
          this.dialogService.openDialogNegative(
            'An error occurred while adding employee.'
          );
        }
      },
    });
  }

  // 유효성 검사 함수
  private hasErrors() {
    const emailError = this.addEmployeeForm.get('email')?.hasError('required');
    const emailtypeError = this.addEmployeeForm.get('email')?.hasError('email');
    const usernameError = this.addEmployeeForm
      .get('username')
      ?.hasError('required');
    const countryError = this.addEmployeeForm
      .get('country')
      ?.hasError('required');
    const empStartDateError = this.addEmployeeForm
      .get('empStartDate')
      ?.hasError('required');

    return (
      emailError ||
      emailtypeError ||
      usernameError ||
      countryError ||
      empStartDateError
    );
  }

  toBack() {
    this.router.navigate([`/company/${this.companyId}/employee/`]);
  }
}
