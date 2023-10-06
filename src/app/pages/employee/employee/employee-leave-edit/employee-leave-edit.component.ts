import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialsModule } from 'src/app/materials/materials.module';
import { EmployeeService } from 'src/app/services/employee.service';
import { Employee } from 'src/app/interfaces/employee.interface';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-employee-leave-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialsModule],
  templateUrl: './employee-leave-edit.component.html',
  styleUrls: ['./employee-leave-edit.component.scss'],
})
export class EmployeeLeaveEditComponent {
  employeeId: string = ''; // url 파라미터
  companyId: string = ''; // url 파라미터
  editEmployeeForm: FormGroup;
  leaveStandards!: FormArray;
  employees = this.employeeService.employees; // 상태관리 중인 직원리스트
  employee!: Employee;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private employeeService: EmployeeService
  ) {
    this.employeeId = this.route.snapshot.params['employeeId'];
    this.companyId = this.route.snapshot.params['id'];
    this.editEmployeeForm = this.fb.group({
      // username: new FormControl('', [Validators.required]),
      // country: new FormControl('', [Validators.required]), // 직원에게 적용할 나라 공휴일. Default Korea
      // phoneNumber: new FormControl(''),
      // empStartDate: new FormControl('', [Validators.required]),
      // empEndDate: new FormControl(''),
      // department: new FormControl(''),
      // position: new FormControl(''),
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
    const employee = this.employees()?.find(
      (employee) => employee._id === this.employeeId
    );
    if (employee) {
      // 상태관리 중인 직원리스트 가 있으면
      this.editEmployeeForm.patchValue(employee.personalLeave);
      this.patchLeaveStadard(employee);
    } else {
      this.getEmployee(); // 상태관리 중인 직원 리스트가 없을 경우 rest api로 호출
    }
  }

  // 상태관리 중인 직원 리스트가 없을 경우 rest api로 호출
  getEmployee() {
    this.employeeService.getEmployee(this.employeeId).subscribe({
      next: (res) => {
        this.employee = res.data;
        this.editEmployeeForm.patchValue(this.employee?.personalLeave);
        this.patchLeaveStadard(this.employee);
      },
      error: (err) => console.error(err),
    });
  }

  createLeaveStandard(i: number): FormGroup {
    return this.fb.group({
      year: i + 1,
      annualLeave: [0, [Validators.min(0)]],
      sickLeave: [0, [Validators.min(0)]],
    });
  }

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

  updateProfileInfo() {
    if (this.editEmployeeForm.valid) {
      console.log('업데이트');
      const companyData = {
        ...this.editEmployeeForm.value,
        personalLeaveId: this.employee?.personalLeave._id,
      };

      this.employeeService
        .updateEmployeeLeaves(this.employeeId, companyData)
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
}
