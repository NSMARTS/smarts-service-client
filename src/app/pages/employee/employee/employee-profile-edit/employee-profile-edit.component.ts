import { Component, DestroyRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { Country, Employee } from 'src/app/interfaces/employee.interface';
import { CountryService } from 'src/app/services/country/country.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/services/dialog/dialog.service';
import { CommonService } from 'src/app/services/common/common.service';
import { EmployeeService } from 'src/app/services/employee/employee.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ManagerService } from 'src/app/services/manager/manager.service';
import { CompanyService } from 'src/app/services/company/company.service';

@Component({
  selector: 'app-employee-profile-edit',
  standalone: true,
  imports: [CommonModule, MaterialsModule, ReactiveFormsModule],
  templateUrl: './employee-profile-edit.component.html',
  styleUrls: ['./employee-profile-edit.component.scss'],
})
export class EmployeeProfileEditComponent {
  // FormGroup
  editEmployeeForm: FormGroup;
  leaveStandards!: FormArray;

  nationList: Country[] = [];
  companyId!: string; //params id
  employeeId: string = ''; // url 파라미터

  employees = this.employeeService.employees; // 상태관리 중인 직원리스트
  employee!: Employee;
  email = new FormControl({ value: '', disabled: true });
  manager = new FormControl('');

  destroyRef = inject(DestroyRef);

  leaveStandardsLength: any;

  allManager: any;
  matchingData: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private countryService: CountryService,
    private employeeService: EmployeeService,
    private managerService: ManagerService,
    private commonService: CommonService,
    private dialogService: DialogService,
    private companyService: CompanyService
  ) {
    this.companyId = this.route.snapshot.params['id'];
    this.employeeId = this.route.snapshot.params['employeeId'];
    this.editEmployeeForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea
      phoneNumber: new FormControl(''),
      empStartDate: new FormControl('', [Validators.required]),
      empEndDate: new FormControl(''),
      department: new FormControl(''),
      position: new FormControl(''),
      // leaveStandards: this.fb.array([]),
      // isRollover: [false],
      // rolloverMaxMonth: [0, [Validators.min(0)]],
      // rolloverMaxLeaveDays: [0, [Validators.min(0)]],
      // countryCode: [''],
      // isReplacementDay: [false],
      // rdValidityTerm: [0, [Validators.min(0)]],
      // isAdvanceLeave: [false],
      // annualPolicy: ['byContract'],
    });

    this.countryService.getCountryList().subscribe({
      next: (res: any) => {
        this.nationList = res.data;
      },
      error: (err: any) => console.error(err),
    });

    this.getCompanyInfo();
  }

  ngOnInit(): void {
    console.log(this.employees);
    const employee = this.employees()?.find(
      (employee) => employee._id === this.employeeId
    );
    if (employee) {
      // 상태관리 중인 직원리스트 가 있으면
      this.getEmployeeStatus(employee);
      // console.log(employee);
    } else {
      this.getEmployee(); // 상태관리 중인 직원 리스트가 없을 경우 rest api로 호출
    }
  }

  getCompanyInfo() {
    this.companyService.getCompanyInfo(this.companyId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.leaveStandardsLength = res.data.leaveStandards.length;
        console.log(this.leaveStandardsLength);
      },
      error: (err: any) => {
        console.log(err.error.message);
      },
    });
  }

  // 상태저장중인 Employee가 있을 경우 호출
  getEmployeeStatus(employee: Employee) {
    console.log(employee);
    this.employee = employee;
    this.email.patchValue(this.employee.email);
    this.manager.patchValue(this.employee.managers[0]?.email);

    this.editEmployeeForm.patchValue(employee);
    this.editEmployeeForm.patchValue(employee.personalLeave);
  }

  // 상태관리 중인 직원 리스트가 없을 경우 rest api로 호출
  getEmployee() {
    this.employeeService.getEmployee(this.employeeId).subscribe({
      next: (res) => {
        console.log(res.data);
        this.employee = res.data;
        this.allManager = res.data.managers;

        this.getManager();
        this.email.patchValue(this.employee.email);
        this.manager.patchValue(this.employee.managers[0]?.email);

        this.editEmployeeForm.patchValue(this.employee);
        this.editEmployeeForm.patchValue(this.employee?.personalLeave);
      },
      error: (err) => console.error(err),
    });
  }

  getManager() {
    this.managerService.getManagerList(this.companyId).subscribe({
      next: (res) => {
        console.log(res.data);
        let managerList = res.data;

        this.matchingData = this.allManager.map((manager: any) => {
          const matchingManager = managerList.find(
            (item: any) => item.email === manager.email
          ) as any;
          if (matchingManager) {
            return {
              ...manager,
              username: matchingManager.username,
              // profileImgPath: matchingManager.profileImgPath,
            };
          } else {
            return manager;
          }
        });
        console.log(this.matchingData);
      },
      error: (err) => {
        console.error(err);
        if (err.status === 404) {
          console.error('No companies found');
        } else {
          console.error('An error occurred while fetching manager list');
        }
      },
    });
  }

  editEmployee() {
    if (this.editEmployeeForm.valid) {
      const postData = {
        ...this.editEmployeeForm.value,
        company: this.companyId,
        country: this.editEmployeeForm.value['country'],
        empStartDate: this.commonService.dateFormatting(
          this.editEmployeeForm.value['empStartDate']
        ),
        empEndDate: this.editEmployeeForm.value['empEndDate']
          ? this.commonService.dateFormatting(
            this.editEmployeeForm.value['empEndDate']
          )
          : null,
      };

      this.employeeService
        .updateEmployeeProfile(this.employeeId, postData)
        .subscribe({
          next: (res) => {
            this.router.navigate([`/company/${this.companyId}/employee`]);
            this.dialogService.openDialogPositive(
              'Successfully, the employee has been edit.'
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

  datePickChange(dateValue: any) {
    this.editEmployeeForm.get('empStartDate')?.setValue(dateValue);
  }

  datePickChange2(dateValue: any) {
    this.editEmployeeForm.get('empEndDate')?.setValue(dateValue);
  }

  toBack() {
    this.router.navigate([`/company/${this.companyId}/employee/`]);
  }

  resetPassword() {
    this.dialogService
      .openDialogConfirm('Do you want password reset?')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res) {
            this.employeeService.resetPassword(this.employeeId).subscribe({
              next: (res) => {
                if (res.success) {
                  this.dialogService.openDialogPositive(
                    'Successfully, the password has been reset "qwer1234".'
                  );
                }
              },
              error: (err: any) => {
                console.error(err);
                this.dialogService.openDialogNegative('Internet Server Error');
              },
            });
          }
        },
        error: (err: any) => {
          console.error(err);
          this.dialogService.openDialogNegative('Internet Server Error');
        },
      });
  }

  //leaveStandards가 만들어져있는 년도 보다 크게는 못만들도록
  myFilter = (d: Date | null): boolean => {
    const currentDate = new Date();
    currentDate.setFullYear(
      currentDate.getFullYear() - this.leaveStandardsLength
    );
    return !(d && d < currentDate);
  };

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
}
