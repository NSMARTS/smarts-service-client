import { EmployeeService } from 'src/app/services/employee.service';
import { Component, HostListener } from '@angular/core';
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
      phoneNumber: new FormControl('', [Validators.pattern(/^[0-9-]*$/)]),
      country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea
      empStartDate: new FormControl('', [Validators.required]),
      empEndDate: new FormControl(''),
      department: new FormControl(''),
      position: new FormControl(''),
    });

    this.countryService.getCountryList().subscribe({
      next: (res: any) => {
        this.nationList = res.data;
      },
      error: (err: any) => console.error(err),
    });
  }

  addEmployee() {
    if (this.addEmployeeForm.valid) {
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
  }

  //input type="number" 한글 안써지도록
  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    if (inputElement.classList.contains('numeric-input')) {
      const numericValue = inputValue.replace(/[^-\d]/g, '');
      inputElement.value = numericValue;
    }
  }

  datePickChange(dateValue: any) {
    this.addEmployeeForm.get('empStartDate')?.setValue(dateValue);
  }

  datePickChange2(dateValue: any) {
    this.addEmployeeForm.get('empEndDate')?.setValue(dateValue);
  }

  toBack() {
    this.router.navigate([`/company/${this.companyId}/employee/`]);
  }
}
