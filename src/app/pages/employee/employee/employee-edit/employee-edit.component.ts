import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { EmployeeService } from 'src/app/services/employee.service';
import { CommonService } from 'src/app/services/common.service';
import { Country, Employee } from 'src/app/interfaces/employee.interface';
import { CountryService } from 'src/app/services/country.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialsModule],
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss'],
})
export class EmployeeEditComponent {
  employeeId: string = ''; // url 파라미터
  companyId: string = ''; // url 파라미터
  // FormGroup
  editEmployeeForm: FormGroup;
  leaveStandards!: FormArray;

  countryList: Country[] = []; // 국가 리스트

  employees = this.employeeService.employees; // 상태관리 중인 직원리스트

  employee!: Employee;

  email = new FormControl({ value: '', disabled: true });
  manager = new FormControl('');

  destroyRef = inject(DestroyRef);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private countryService: CountryService,
    private dialogService: DialogService,
    private commonService: CommonService
  ) {
    this.employeeId = this.route.snapshot.params['employeeId'];
    this.companyId = this.route.snapshot.params['id'];
    this.editEmployeeForm = this.fb.group({
      username: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea
      phoneNumber: new FormControl(''),
      empStartDate: new FormControl('', [Validators.required]),
      empEndDate: new FormControl(''),
      department: new FormControl(''),
      position: new FormControl(''),
      leaveStandards: this.fb.array([]),
      isRollover: [false],
      rolloverMaxMonth: [0, [Validators.min(0)]],
      rolloverMaxLeaveDays: [0, [Validators.min(0)]],
      countryCode: [''],
      isReplacementDay: [false],
      rdValidityTerm: [0, [Validators.min(0)]],
      isAdvanceLeave: [false],
      annualPolicy: ['byContract'],
    });
    this.leaveStandards = this.editEmployeeForm.get(
      'leaveStandards'
    ) as FormArray;
    this.addItem();
  }

  ngOnInit(): void {
    // 나라 리스트부터 호출 후 직원정보를 불러옴
    this.getCountryList();
  }

  /**
   * + 버튼 누를 시 item을 추가
   * @returns
   */
  createLeaveStandard(i: number): FormGroup {
    return this.fb.group({
      year: i + 1,
      annualLeave: [0, [Validators.min(0)]],
      sickLeave: [0, [Validators.min(0)]],
    });
  }

  /**
   * + 버튼 클릭 시
   * 기존에 가져온 연차정책에
   * {year:leaveStandards.lenhth, annualLeave: 0 , sickLeave: 0}
   * leaveStandards : FormArray에 담는다.
   */
  addItem() {
    const newYear = this.leaveStandards.length + 1;
    const newLeaveStandard = this.createLeaveStandard(newYear);
    this.leaveStandards.push(newLeaveStandard);
    this.updateYears();
  }

  cancelItem(i: any) {
    if (this.leaveStandards) {
      this.leaveStandards.removeAt(i);
      this.updateYears();
    }
  }
  /**
   * item에 year를 추가하거나 제거하면
   * leaveStandards에 기존 배열의 year들도 수정
   */
  updateYears() {
    this.leaveStandards.controls.forEach((group, index) => {
      group.get('year')?.setValue(index + 1);
    });
  }

  getLeaveStandardsControls() {
    return (this.editEmployeeForm.get('leaveStandards') as FormArray).controls;
  }

  /**
   * 기존 연차정책을 가져와, formgroup객체 형식으로 만든 후 FormArray에 담는다.
   * @returns
   */
  getLeaveStandard(data: any): FormGroup {
    return this.fb.group({
      year: data.year,
      annualLeave: [data.annualLeave, [Validators.min(0)]],
      sickLeave: [data.sickLeave, [Validators.min(0)]],
    });
  }

  patchLeaveStadard(employee: Employee) {
    this.leaveStandards.clear();
    this.leaveStandards = this.editEmployeeForm.get(
      'leaveStandards'
    ) as FormArray;
    // 기존 컨트롤 제거
    this.leaveStandards.clear();
    // 새로운 컨트롤 추가
    for (let i = 0; i < employee.personalLeave.leaveStandards.length; i++) {
      this.leaveStandards.push(
        this.getLeaveStandard(employee.personalLeave.leaveStandards[i])
      );
    }
  }

  getCountryList() {
    this.countryService.getCountryList().subscribe({
      next: (res: any) => {
        this.countryList = res.data;
      },
      error: (err) => console.error(err),
      complete: () => {
        // 나라목록 호출이 끝나면 실행
        const employee = this.employees()?.find(
          (employee) => employee._id === this.employeeId
        );
        if (employee) {
          // 상태관리 중인 직원리스트 가 있으면
          this.getEmployeeStatus(employee);
        } else {
          this.getEmployee(); // 상태관리 중인 직원 리스트가 없을 경우 rest api로 호출
        }
      },
    });
  }

  // 상태저장중인 Employee가 있을 경우 호출
  getEmployeeStatus(employee: Employee) {
    this.employee = employee;
    this.email.patchValue(this.employee.email);
    this.manager.patchValue(this.employee.managers[0]?.email);

    this.editEmployeeForm.patchValue(employee);
    this.editEmployeeForm.patchValue(employee.personalLeave);
    this.patchLeaveStadard(employee); // 직원들 중 상태 관리하는 애들이 없으면
  }

  // 상태관리 중인 직원 리스트가 없을 경우 rest api로 호출
  getEmployee() {
    this.employeeService.getEmployee(this.employeeId).subscribe({
      next: (res) => {
        this.employee = res.data;
        this.email.patchValue(this.employee.email);
        this.manager.patchValue(this.employee.managers[0]?.email);

        this.editEmployeeForm.patchValue(this.employee);
        this.editEmployeeForm.patchValue(this.employee?.personalLeave);
        this.patchLeaveStadard(this.employee);
      },
      error: (err) => console.error(err),
    });
  }

  backManagerList() {
    this.router.navigate([`company/${this.companyId}/employee`]);
  }

  updateProfileInfo() {
    const companyData = {
      ...this.editEmployeeForm.value,
      personalLeaveId: this.employee?.personalLeave._id,
    };

    this.employeeService
      .updateEmployee(this.employeeId, companyData)
      .subscribe({
        next: () => {
          this.router.navigate([`company/${this.companyId}/employee`]);
          this.dialogService.openDialogPositive(
            'Successfully, the employee has been edit.'
          );
        },
        error: (err) => {
          console.error(err);
        },
      });
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
                    'Successfully, the password has been reset.'
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

  updateLeaveInfo() {}
}
